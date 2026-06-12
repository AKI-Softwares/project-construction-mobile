import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import * as SecureStore from 'expo-secure-store';
import type { User } from '@/types/auth.types';

const secureStorage = {
  getItem: (name: string) => SecureStore.getItemAsync(name),
  setItem: (name: string, value: string) => SecureStore.setItemAsync(name, value),
  removeItem: (name: string) => SecureStore.deleteItemAsync(name),
};

interface AuthState {
  token: string | null;
  user: User | null;
  mustChangePassword: boolean;
  _hasHydrated: boolean;
  login: (token: string, user: User, mustChangePassword?: boolean) => void;
  logout: () => void;
  clearMustChangePassword: () => void;
  setHydrated: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      mustChangePassword: false,
      _hasHydrated: false,
      login: (token, user, mustChangePassword = false) =>
        set({ token, user, mustChangePassword }),
      logout: () => set({ token: null, user: null, mustChangePassword: false }),
      clearMustChangePassword: () => set({ mustChangePassword: false }),
      setHydrated: () => set({ _hasHydrated: true }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => secureStorage),
      partialize: (state) => ({ token: state.token, user: state.user }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated();
      },
    },
  ),
);
