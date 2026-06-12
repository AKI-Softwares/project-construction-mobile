import MockAdapter from 'axios-mock-adapter';
import { api } from '../../src/services/api';
import { authService } from '../../src/services/auth.service';

const mock = new MockAdapter(api);

describe('authService', () => {
  afterEach(() => mock.reset());

  describe('login', () => {
    it('retorna token quando credenciais válidas', async () => {
      mock.onPost('/auth/login').reply(200, { token: 'abc123' });
      const result = await authService.login({ email: 'a@b.com', password: '12345678' });
      expect(result.token).toBe('abc123');
    });

    it('rejeita promise em 401', async () => {
      mock.onPost('/auth/login').reply(401, { message: 'Invalid credentials' });
      await expect(authService.login({ email: 'a@b.com', password: 'wrong' }))
        .rejects.toMatchObject({ response: { status: 401 } });
    });

    it('rejeita promise em 403', async () => {
      mock.onPost('/auth/login').reply(403, { message: 'Company account is inactive or pending approval.' });
      await expect(authService.login({ email: 'a@b.com', password: '12345678' }))
        .rejects.toMatchObject({ response: { status: 403 } });
    });
  });

  describe('getMe', () => {
    it('retorna dados do usuário autenticado', async () => {
      const user = { id: 1, name: 'Felipe', email: 'f@f.com', role: { id: 2, name: 'Inspector' } };
      mock.onGet('/auth/me').reply(200, user);
      const result = await authService.getMe();
      expect(result).toEqual(user);
    });
  });

  describe('changePassword', () => {
    it('resolve em 200', async () => {
      mock.onPost('/auth/change-password').reply(200, { message: 'Password updated successfully.' });
      await expect(authService.changePassword('OldPass1', 'NewPass123')).resolves.toBeUndefined();
    });

    it('rejeita em 401 (senha atual incorreta)', async () => {
      mock.onPost('/auth/change-password').reply(401, { message: 'Current password is incorrect.' });
      await expect(authService.changePassword('wrong', 'NewPass123'))
        .rejects.toMatchObject({ response: { status: 401 } });
    });
  });

  describe('forgotPassword', () => {
    it('resolve em 200 independente do email', async () => {
      mock.onPost('/auth/forgot-password').reply(200, {
        message: 'If this email is registered, a reset link will be sent.',
      });
      await expect(authService.forgotPassword('any@email.com')).resolves.toBeUndefined();
    });
  });
});
