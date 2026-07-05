import Toast from 'react-native-toast-message';
import type { AxiosError } from 'axios';

export function showToast(type: 'success' | 'error' | 'info', message: string): void {
  Toast.show({
    type,
    text1: message,
    visibilityTime: type === 'error' ? 4000 : 2500,
    position: 'top',
  });
}

export function apiErrorMessage(error: unknown, fallback: string): string {
  const e = error as AxiosError<{ message?: string }>;
  const serverMsg = e?.response?.data?.message;
  if (serverMsg && typeof serverMsg === 'string') return serverMsg;
  if (e?.message === 'Network Error') return 'Sem conexão com o servidor';
  if (e?.code === 'ECONNABORTED') return 'Tempo limite da requisição excedido';
  return fallback;
}
