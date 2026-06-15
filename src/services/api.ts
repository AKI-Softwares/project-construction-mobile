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

const AUTH_ENDPOINTS_NO_LOGOUT = ['/auth/change-password', '/auth/reset-password'];

// Interceptor de response: logout em 401, exceto endpoints de auth que usam 401 para senha inválida
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const url: string = error.config?.url ?? '';
    const isAuthEndpoint = AUTH_ENDPOINTS_NO_LOGOUT.some((e) => url.includes(e));
    if (error.response?.status === 401 && !isAuthEndpoint) {
      const { useAuthStore } = require('@/store/auth.store');
      const store = useAuthStore.getState();
      if (store.token) {
        store.logout();
      }
    }
    return Promise.reject(error);
  },
);
