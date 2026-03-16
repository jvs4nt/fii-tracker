import axios from 'axios';
import type { AxiosRequestConfig, AxiosResponse } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

interface CacheEntry<T> {
  expiresAt: number;
  data: T;
}

const responseCache = new Map<string, CacheEntry<unknown>>();
const inFlightRequests = new Map<string, Promise<AxiosResponse<unknown>>>();

const buildCacheKey = (url: string, config?: AxiosRequestConfig) => {
  const params = config?.params ? JSON.stringify(config.params) : '';
  return `${url}?${params}`;
};

const getWithCache = async <T>(
  url: string,
  config?: AxiosRequestConfig,
  ttlMs = 30_000
): Promise<AxiosResponse<T>> => {
  const key = buildCacheKey(url, config);
  const now = Date.now();
  const cached = responseCache.get(key);

  if (cached && cached.expiresAt > now) {
    return {
      data: cached.data as T,
      status: 200,
      statusText: 'OK',
      headers: {},
      config: config ?? {},
    } as AxiosResponse<T>;
  }

  const pending = inFlightRequests.get(key);
  if (pending) {
    return pending as Promise<AxiosResponse<T>>;
  }

  const request = api
    .get<T>(url, config)
    .then((response) => {
      responseCache.set(key, {
        expiresAt: now + ttlMs,
        data: response.data,
      });
      return response;
    })
    .finally(() => {
      inFlightRequests.delete(key);
    });

  inFlightRequests.set(key, request as Promise<AxiosResponse<unknown>>);
  return request;
};

const invalidateCacheByPrefix = (prefixes: string[]) => {
  for (const key of responseCache.keys()) {
    if (prefixes.some((prefix) => key.startsWith(prefix))) {
      responseCache.delete(key);
    }
  }
};

const invalidatePortfolioCache = () => {
  invalidateCacheByPrefix([
    '/fii/dashboard?',
    '/fii/analysis?',
    '/holdings?',
    '/dividends?',
  ]);
};

export const authApi = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  register: (email: string, password: string) =>
    api.post('/auth/register', { email, password }),
};

export const holdingsApi = {
  getAll: () => getWithCache('/holdings', undefined, 30_000),
  create: async (data: { ticker: string; quantity: number; avgPrice: number; purchaseDate: string }) => {
    const response = await api.post('/holdings', data);
    invalidatePortfolioCache();
    return response;
  },
  update: (id: string, data: { ticker?: string; quantity?: number; avgPrice?: number; purchaseDate?: string }) =>
    api.put(`/holdings/${id}`, data).then((response) => {
      invalidatePortfolioCache();
      return response;
    }),
  delete: (id: string) =>
    api.delete(`/holdings/${id}`).then((response) => {
      invalidatePortfolioCache();
      return response;
    }),
};

export const dividendsApi = {
  getAll: () => getWithCache('/dividends', undefined, 30_000),
  create: (data: { ticker: string; amount: number; type: string; exDate: string; payDate?: string }) =>
    api.post('/dividends', data).then((response) => {
      invalidatePortfolioCache();
      return response;
    }),
  markReceived: (id: string) =>
    api.put(`/dividends/${id}/receive`).then((response) => {
      invalidatePortfolioCache();
      return response;
    }),
  delete: (id: string) =>
    api.delete(`/dividends/${id}`).then((response) => {
      invalidatePortfolioCache();
      return response;
    }),
};

export const fiiApi = {
  getQuote: (ticker: string) => getWithCache(`/fii/quote/${ticker}`, undefined, 30_000),
  getDividends: (ticker: string) => getWithCache(`/fii/dividends/${ticker}`, undefined, 60_000),
  getAnalysis: () => getWithCache<unknown[]>('/fii/analysis', undefined, 20_000),
  getDashboard: () => getWithCache<Record<string, unknown>>('/fii/dashboard', undefined, 20_000),
  search: (query: string, signal?: AbortSignal) =>
    getWithCache<string[]>('/fii/search', { params: { q: query }, signal }, 60_000),
};

export const invalidateApiCache = {
  all: () => responseCache.clear(),
  portfolio: invalidatePortfolioCache,
};

export default api;
