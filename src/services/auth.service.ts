import { api } from './api';
import type { LoginRequest, LoginResponse, User } from '@/types/auth.types';

export const authService = {
  login: (data: LoginRequest): Promise<LoginResponse> =>
    api.post<LoginResponse>('/auth/login', data).then((r) => r.data),

  getMe: (): Promise<User> =>
    api.get<User>('/auth/me').then((r) => r.data),
};
