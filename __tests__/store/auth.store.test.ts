import { act } from 'react';
import { useAuthStore } from '../../src/store/auth.store';
import type { User } from '../../src/types/auth.types';

const mockUser: User = {
  id: 1,
  name: 'Felipe',
  email: 'felipe@checkobra.com',
  role: { id: 2, name: 'Inspector' },
};

describe('authStore', () => {
  beforeEach(() => {
    useAuthStore.setState({ token: null, user: null, mustChangePassword: false, _hasHydrated: false });
  });

  it('estado inicial é nulo', () => {
    const { token, user, mustChangePassword } = useAuthStore.getState();
    expect(token).toBeNull();
    expect(user).toBeNull();
    expect(mustChangePassword).toBe(false);
  });

  it('login define token, user e mustChangePassword', async () => {
    await act(async () => useAuthStore.getState().login('tok123', mockUser, true));
    const state = useAuthStore.getState();
    expect(state.token).toBe('tok123');
    expect(state.user).toEqual(mockUser);
    expect(state.mustChangePassword).toBe(true);
  });

  it('login com mustChangePassword omitido usa false', async () => {
    await act(async () => useAuthStore.getState().login('tok123', mockUser));
    expect(useAuthStore.getState().mustChangePassword).toBe(false);
  });

  it('clearMustChangePassword reseta para false', async () => {
    await act(async () => {
      useAuthStore.getState().login('tok123', mockUser, true);
      useAuthStore.getState().clearMustChangePassword();
    });
    expect(useAuthStore.getState().mustChangePassword).toBe(false);
  });

  it('logout limpa token, user e mustChangePassword', async () => {
    await act(async () => {
      useAuthStore.getState().login('tok123', mockUser, true);
      useAuthStore.getState().logout();
    });
    expect(useAuthStore.getState().token).toBeNull();
    expect(useAuthStore.getState().user).toBeNull();
    expect(useAuthStore.getState().mustChangePassword).toBe(false);
  });

  it('setHydrated marca _hasHydrated como true', async () => {
    await act(async () => useAuthStore.getState().setHydrated());
    expect(useAuthStore.getState()._hasHydrated).toBe(true);
  });
});
