import axios from 'axios';
import prismaClient from '../database';
import { fetchMultipleFiiData } from './fiiService';

export interface AssistantHistoryItem {
  role: 'user' | 'assistant';
  content: string;
}

export interface AssistantResponse {
  answer: string;
  usedExternalModel: boolean;
}

export class AssistantRateLimitError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AssistantRateLimitError';
  }
}

interface RateState {
  count: number;
  windowStart: number;
}

const rateMap = new Map<string, RateState>();
const RATE_WINDOW_MS = 5 * 60 * 1000;
const RATE_MAX_REQUESTS = 12;

function enforceRateLimit(userId: string) {
  const now = Date.now();
  const state = rateMap.get(userId);

  if (!state || now - state.windowStart > RATE_WINDOW_MS) {
    rateMap.set(userId, { count: 1, windowStart: now });
    return;
  }

  if (state.count >= RATE_MAX_REQUESTS) {
    throw new AssistantRateLimitError('Limite de mensagens temporariamente atingido. Tente novamente em alguns minutos.');
  }

  state.count += 1;
  rateMap.set(userId, state);
}

function toISODate(value: Date | null): string {
  if (!value) {
    return 'N/A';
  }
  return value.toISOString().slice(0, 10);
}

async function buildPortfolioContext(userId: string): Promise<string> {
  const holdings = await prismaClient.holding.findMany({
    where: { userId },
    orderBy: { ticker: 'asc' },
  });

  const dividends = await prismaClient.dividend.findMany({
    where: { userId },
    orderBy: { exDate: 'desc' },
    take: 50,
  });

  const tickers = holdings.map((item) => item.ticker);
  const quotes = tickers.length > 0 ? await fetchMultipleFiiData(tickers) : {};

  let totalInvested = 0;
  let totalCurrent = 0;

  const holdingsLines = holdings.map((item) => {
    const quote = quotes[item.ticker] || {};
    const currentPrice = Number(quote.currentPrice || item.avgPrice);
    const currentValue = item.quantity * currentPrice;
    const investedValue = item.quantity * item.avgPrice;

    totalInvested += investedValue;
    totalCurrent += currentValue;

    return [
      `- ${item.ticker}`,
      `qtd=${item.quantity.toFixed(2)}`,
      `pm=${item.avgPrice.toFixed(2)}`,
      `precoAtual=${currentPrice.toFixed(2)}`,
      `valorAtual=${currentValue.toFixed(2)}`,
      `setor=${String(quote.sector || 'N/A')}`,
      `dy12m=${Number(quote.dy12m || 0).toFixed(2)}%`,
      `pvp=${quote.pVP ? Number(quote.pVP).toFixed(2) : 'N/A'}`,
    ].join(' | ');
  });

  const pending = dividends.filter((item) => item.status === 'pending');
  const received = dividends.filter((item) => item.status === 'received');

  const totalReceived = received.reduce((sum, item) => sum + item.amount, 0);
  const totalPending = pending.reduce((sum, item) => sum + item.amount, 0);

  const pendingLines = pending.slice(0, 15).map((item) => {
    return `- ${item.ticker} | valor=${item.amount.toFixed(2)} | ex=${toISODate(item.exDate)} | pag=${toISODate(item.payDate)}`;
  });

  const gainLoss = totalCurrent - totalInvested;
  const gainLossPct = totalInvested > 0 ? (gainLoss / totalInvested) * 100 : 0;

  return [
    'CONTEXTO REAL DO USUARIO (NUNCA inventar numeros fora daqui):',
    `- totalInvestido=${totalInvested.toFixed(2)}`,
    `- totalAtual=${totalCurrent.toFixed(2)}`,
    `- ganhoPrejuizo=${gainLoss.toFixed(2)} (${gainLossPct.toFixed(2)}%)`,
    `- proventosRecebidos=${totalReceived.toFixed(2)}`,
    `- proventosPendentes=${totalPending.toFixed(2)}`,
    `- quantidadeAtivos=${holdings.length}`,
    '',
    'ATIVOS:',
    holdingsLines.length > 0 ? holdingsLines.join('\n') : '- carteira vazia',
    '',
    'PROVENTOS PENDENTES (amostra):',
    pendingLines.length > 0 ? pendingLines.join('\n') : '- nenhum',
  ].join('\n');
}

function buildSystemPrompt(): string {
  return [
    'Voce e o assistente financeiro do InvesteIA.',
    'Responda em portugues do Brasil, de forma objetiva e didatica.',
    'Use somente os dados de contexto fornecidos para falar da carteira do usuario.',
    'Quando faltar dado, diga explicitamente que nao ha informacao suficiente.',
    'Nunca prometa retorno, nunca diga que e recomendacao garantida e sempre inclua alerta de risco.',
    'Se o usuario pedir decisao de compra/venda, responda com cenarios, riscos e pontos de verificacao.',
    'Responda com no maximo 8 linhas, exceto quando o usuario pedir detalhe.',
  ].join(' ');
}

export async function chatWithPortfolioAssistant(
  userId: string,
  message: string,
  history: AssistantHistoryItem[] = []
): Promise<AssistantResponse> {
  enforceRateLimit(userId);

  const sanitizedMessage = message.trim();
  if (!sanitizedMessage) {
    return {
      answer: 'Envie uma pergunta para eu te ajudar com investimentos e com sua carteira.',
      usedExternalModel: false,
    };
  }

  const portfolioContext = await buildPortfolioContext(userId);

  const apiKey = process.env.AI_API_KEY;
  const model = process.env.AI_MODEL || 'gpt-4o-mini';
  const baseUrl = process.env.AI_BASE_URL || 'https://api.openai.com/v1';
  const maxTokens = Number(process.env.AI_MAX_TOKENS || 550);
  const temperature = Number(process.env.AI_TEMPERATURE || 0.35);

  if (!apiKey) {
    return {
      answer:
        'Assistente IA pronto no sistema, mas a chave AI_API_KEY ainda nao foi configurada no backend. Assim que voce configurar, eu respondo com inteligencia contextual da sua carteira.',
      usedExternalModel: false,
    };
  }

  const trimmedHistory = history
    .filter((item) => item && (item.role === 'user' || item.role === 'assistant'))
    .slice(-8)
    .map((item) => ({ role: item.role, content: item.content.slice(0, 1500) }));

  let answer: unknown;
  try {
    const response = await axios.post(
      `${baseUrl}/chat/completions`,
      {
        model,
        temperature,
        max_tokens: maxTokens,
        messages: [
          { role: 'system', content: buildSystemPrompt() },
          { role: 'system', content: portfolioContext },
          ...trimmedHistory,
          { role: 'user', content: sanitizedMessage },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        timeout: 25000,
      }
    );

    answer = response.data?.choices?.[0]?.message?.content;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      const providerStatus = error.response?.status;
      const providerMessage =
        (error.response?.data as { error?: { message?: string } })?.error?.message ||
        error.message;

      console.error('AI provider call failed:', providerStatus, providerMessage);

      return {
        answer:
          providerStatus === 401 || providerStatus === 403
            ? 'Nao consegui autenticar no provedor de IA. Verifique AI_API_KEY e permissao do modelo no backend.'
            : providerStatus === 429
              ? 'O provedor de IA atingiu limite de uso no momento. Tente novamente em instantes.'
              : 'O provedor de IA falhou ao responder agora. Tente novamente em alguns minutos.',
        usedExternalModel: false,
      };
    }

    console.error('Unexpected AI provider error:', error);
    return {
      answer: 'Nao consegui acessar o provedor de IA neste momento. Tente novamente mais tarde.',
      usedExternalModel: false,
    };
  }

  if (!answer || typeof answer !== 'string') {
    return {
      answer: 'Nao consegui gerar resposta agora. Tente reformular a pergunta em alguns segundos.',
      usedExternalModel: true,
    };
  }

  return {
    answer: answer.trim(),
    usedExternalModel: true,
  };
}
