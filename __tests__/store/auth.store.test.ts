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
    useAuthStore.setState({ token: null, user: null, _hasHydrated: false });
  });

  it('estado inicial é nulo', () => {
    const { token, user } = useAuthStore.getState();
    expect(token).toBeNull();
    expect(user).toBeNull();
  });

  it('login define token e user', async () => {
    await act(async () => useAuthStore.getState().login('tok123', mockUser));
    expect(useAuthStore.getState().token).toBe('tok123');
    expect(useAuthStore.getState().user).toEqual(mockUser);
  });

  it('logout limpa token e user', async () => {
    await act(async () => {
      useAuthStore.getState().login('tok123', mockUser);
      useAuthStore.getState().logout();
    });
    expect(useAuthStore.getState().token).toBeNull();
    expect(useAuthStore.getState().user).toBeNull();
  });

  it('setHydrated marca _hasHydrated como true', async () => {
    await act(async () => useAuthStore.getState().setHydrated());
    expect(useAuthStore.getState()._hasHydrated).toBe(true);
  });
});
