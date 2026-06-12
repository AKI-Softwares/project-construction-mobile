import { api } from './api';
import type { LoginRequest, LoginResponse, User } from '@/types/auth.types';

export const authService = {
  login: (data: LoginRequest): Promise<LoginResponse> =>
    api.post<LoginResponse>('/auth/login', data).then((r) => r.data),

  getMe: (token?: string): Promise<User> =>
    api
      .get<User>('/auth/me', token ? { headers: { Authorization: `Bearer ${token}` } } : {})
      .then((r) => r.data),

  changePassword: (currentPassword: string, newPassword: string): Promise<void> =>
    api.post('/auth/change-password', { currentPassword, newPassword }).then(() => undefined),

  forgotPassword: (email: string): Promise<void> =>
    api.post('/auth/forgot-password', { email }).then(() => undefined),

  resetPassword: (token: string, newPassword: string): Promise<void> =>
    api.post('/auth/reset-password', { token, newPassword }).then(() => undefined),
};
