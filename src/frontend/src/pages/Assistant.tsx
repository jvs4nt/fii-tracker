import { useMemo, useState } from 'react';
import Layout from '../components/Layout';
import { aiApi } from '../api';
import { Bot, Send, Loader2 } from 'lucide-react';
import axios from 'axios';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

const initialMessages: ChatMessage[] = [
  {
    role: 'assistant',
    content:
      'Oi! Sou o assistente do InvesteIA. Posso tirar duvidas sobre investimentos e analisar sua carteira com base nos ativos cadastrados.',
  },
];

export default function Assistant() {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const history = useMemo(
    () =>
      messages
        .filter((item) => item.role === 'user' || item.role === 'assistant')
        .slice(-8),
    [messages]
  );

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const message = input.trim();
    if (!message || loading) {
      return;
    }

    const nextUserMessage: ChatMessage = { role: 'user', content: message };
    setMessages((prev) => [...prev, nextUserMessage]);
    setInput('');
    setError(null);
    setLoading(true);

    try {
      const response = await aiApi.chat({
        message,
        history,
      });

      const answer = response.data?.answer || 'Nao consegui responder agora. Tente novamente.';

      setMessages((prev) => [...prev, { role: 'assistant', content: answer }]);
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        setError('Sessao expirada. Faca login novamente para usar o Assistente IA.');
      } else {
        setError('Nao foi possivel consultar o assistente agora.');
      }
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content:
            'Estou com dificuldade para responder neste momento. Tente novamente em alguns instantes.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const suggestions = [
    'Quais ativos da minha carteira parecem mais descontados pelo P/VP?',
    'Como esta meu risco de concentracao por setor?',
    'Explique minha carteira em termos simples para iniciante.',
  ];

  return (
    <Layout
      title="Assistente IA"
      subtitle="Tire duvidas sobre investimentos e sobre seus ativos"
      actions={
        <button
          className="btn btn-secondary"
          onClick={() => setMessages(initialMessages)}
          type="button"
        >
          Limpar conversa
        </button>
      }
    >
      <div className="assistant-shell">
        <div className="assistant-messages">
          {messages.map((msg, index) => (
            <div
              key={`${msg.role}-${index}`}
              className={`assistant-bubble ${msg.role === 'user' ? 'user' : 'assistant'}`}
            >
              {msg.role === 'assistant' && (
                <div className="assistant-avatar">
                  <Bot size={16} />
                </div>
              )}
              <p>{msg.content}</p>
            </div>
          ))}

          {loading && (
            <div className="assistant-bubble assistant">
              <div className="assistant-avatar">
                <Bot size={16} />
              </div>
              <p style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Loader2 size={14} className="spin" />
                Pensando na melhor resposta...
              </p>
            </div>
          )}
        </div>

        <div className="assistant-suggestions">
          {suggestions.map((item) => (
            <button
              key={item}
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => setInput(item)}
            >
              {item}
            </button>
          ))}
        </div>

        {error && <div className="error-message">{error}</div>}

        <form className="assistant-form" onSubmit={handleSubmit}>
          <input
            className="form-input"
            placeholder="Pergunte sobre sua carteira, riscos, proventos e indicadores..."
            value={input}
            onChange={(event) => setInput(event.target.value)}
            maxLength={1500}
          />
          <button className="btn btn-primary" type="submit" disabled={loading || !input.trim()}>
            <Send size={16} />
            Enviar
          </button>
        </form>
      </div>
    </Layout>
  );
}
