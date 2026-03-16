import axios from 'axios';
import * as https from 'https';

const ANBIMA_CLIENT_ID = process.env.ANBIMA_CLIENT_ID;
const ANBIMA_CLIENT_SECRET = process.env.ANBIMA_CLIENT_SECRET;
const ANBIMA_USE_SANDBOX = process.env.ANBIMA_USE_SANDBOX === 'true'; 

const ANBIMA_BASE_DOMAIN = ANBIMA_USE_SANDBOX ? 'api-sandbox.anbima.com.br' : 'api.anbima.com.br';
const ANBIMA_OAUTH_URL = `https://${ANBIMA_BASE_DOMAIN}/oauth/access-token`;
const ANBIMA_API_BASE = `https://${ANBIMA_BASE_DOMAIN}/feed/fundos/v2`;

// Agent para ignorar erro de certificado no sandbox se necessário
const httpsAgent = new https.Agent({
  rejectUnauthorized: !ANBIMA_USE_SANDBOX
});

interface AnbimaToken {
  access_token: string;
  expires_at: number;
}

let cachedToken: AnbimaToken | null = null;

/**
 * Obtém ou renova o token de acesso OAuth2 da ANBIMA
 */
async function getAccessToken(): Promise<string | null> {
  if (cachedToken && cachedToken.expires_at > Date.now()) {
    return cachedToken.access_token;
  }

  if (!ANBIMA_CLIENT_ID || !ANBIMA_CLIENT_SECRET) {
    console.warn('[ANBIMA] Credentials missing.');
    return null;
  }

  try {
    const auth = Buffer.from(`${ANBIMA_CLIENT_ID}:${ANBIMA_CLIENT_SECRET}`).toString('base64');
    const response = await axios.post(
      ANBIMA_OAUTH_URL,
      { grant_type: 'client_credentials' },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${auth}`,
        },
        httpsAgent
      }
    );

    const { access_token, expires_in } = response.data;
    cachedToken = {
      access_token,
      expires_at: Date.now() + (expires_in - 60) * 1000,
    };

    console.log('[ANBIMA] Token obtido com sucesso.');
    return access_token;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('[ANBIMA] Erro no OAuth:', error.response?.data || error.message);
    } else {
      console.error('[ANBIMA] Erro no OAuth:', (error as Error).message);
    }
    return null;
  }
}

/**
 * Busca o código ANBIMA de um fundo pelo ticker (nome comercial)
 */
export async function getAnbimaCodeByTicker(ticker: string): Promise<string | null> {
  const token = await getAccessToken();
  if (!token) return null;

  try {
    const response = await axios.get(`${ANBIMA_API_BASE}/fundos`, {
      params: { 'tipo-fundo': 'FII', size: 100 },
      headers: { 
        'access_token': token,
        'client_id': ANBIMA_CLIENT_ID
      },
      httpsAgent
    });

    const fundos = (response.data.content as Array<{ 
      nome_comercial_fundo?: string; 
      razao_social_fundo?: string; 
      codigo_fundo: string 
    }>) || [];
    const fundo = fundos.find((f) => 
      (f.nome_comercial_fundo as string)?.toUpperCase().includes(ticker.toUpperCase()) ||
      (f.razao_social_fundo as string)?.toUpperCase().includes(ticker.toUpperCase())
    );

    return (fundo?.codigo_fundo as string) || null;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(`[ANBIMA] Erro ao buscar código para ${ticker}:`, JSON.stringify(error.response?.data) || error.message);
    } else {
      console.error(`[ANBIMA] Erro ao buscar código para ${ticker}:`, (error as Error).message);
    }
    return null;
  }
}

/**
 * Obtém os detalhes de um fundo pelo código ANBIMA
 */
export async function getAnbimaFundoDetails(codigoFundo: string) {
  const token = await getAccessToken();
  if (!token) return null;

  try {
    const response = await axios.get(`${ANBIMA_API_BASE}/fundos/${codigoFundo}`, {
      headers: { 
        'access_token': token,
        'client_id': ANBIMA_CLIENT_ID
      },
      httpsAgent
    });

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(`[ANBIMA] Erro ao buscar detalhes para ${codigoFundo}:`, JSON.stringify(error.response?.data) || error.message);
    } else {
      console.error(`[ANBIMA] Erro ao buscar detalhes para ${codigoFundo}:`, (error as Error).message);
    }
    return null;
  }
}

/**
 * Obtém a série histórica de um fundo (onde fica o PL e Valor da Cota/VP)
 */
export async function getAnbimaFundoHistory(codigoFundo: string) {
  const token = await getAccessToken();
  if (!token) return null;

  try {
    const response = await axios.get(`${ANBIMA_API_BASE}/fundos/${codigoFundo}/serie-historica`, {
      headers: { 
        'access_token': token,
        'client_id': ANBIMA_CLIENT_ID
      },
      httpsAgent
    });

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(`[ANBIMA] Erro ao buscar histórico para ${codigoFundo}:`, JSON.stringify(error.response?.data) || error.message);
    } else {
      console.error(`[ANBIMA] Erro ao buscar histórico para ${codigoFundo}:`, (error as Error).message);
    }
    return null;
  }
}
