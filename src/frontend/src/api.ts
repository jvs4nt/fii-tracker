import axios from 'axios';

const API_BASE_URL = 'http://localhost:3333/api';

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

export const authApi = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  register: (email: string, password: string) =>
    api.post('/auth/register', { email, password }),
};

export const holdingsApi = {
  getAll: () => api.get('/holdings'),
  create: (data: { ticker: string; quantity: number; avgPrice: number; purchaseDate: string }) =>
    api.post('/holdings', data),
  update: (id: string, data: { ticker?: string; quantity?: number; avgPrice?: number; purchaseDate?: string }) =>
    api.put(`/holdings/${id}`, data),
  delete: (id: string) => api.delete(`/holdings/${id}`),
};

export const dividendsApi = {
  getAll: () => api.get('/dividends'),
  create: (data: { ticker: string; amount: number; type: string; exDate: string; payDate?: string }) =>
    api.post('/dividends', data),
  markReceived: (id: string) => api.put(`/dividends/${id}/receive`),
  delete: (id: string) => api.delete(`/dividends/${id}`),
};

export const fiiApi = {
  getQuote: (ticker: string) => api.get(`/fii/quote/${ticker}`),
  getDividends: (ticker: string) => api.get(`/fii/dividends/${ticker}`),
  getAnalysis: () => api.get('/fii/analysis'),
  getDashboard: () => api.get('/fii/dashboard'),
};

export default api;
