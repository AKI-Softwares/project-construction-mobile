import axios from 'axios';
import { API_URL } from '@/lib/constants';

export const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

// Interceptor de request: injeta token JWT
api.interceptors.request.use((config) => {
  // Importação lazy para evitar dependência circular
  const { useAuthStore } = require('@/store/auth.store');
  const token: string | null = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor de response: logout em 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const { useAuthStore } = require('@/store/auth.store');
      const store = useAuthStore.getState();
      if (store.token) {
        store.logout();
      }
    }
    return Promise.reject(error);
  },
);
