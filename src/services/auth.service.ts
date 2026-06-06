import { api } from './api';
import type { LoginRequest, LoginResponse, User } from '@/types/auth.types';

export const authService = {
  login: (data: LoginRequest): Promise<LoginResponse> =>
    api.post<LoginResponse>('/auth/login', data).then((r) => r.data),

  // Aceita token explícito para o fluxo de login, onde o store ainda não foi
  // atualizado e o interceptor não teria como injetar o Authorization.
  getMe: (token?: string): Promise<User> =>
    api
      .get<User>('/auth/me', token ? { headers: { Authorization: `Bearer ${token}` } } : undefined)
      .then((r) => r.data),
};
