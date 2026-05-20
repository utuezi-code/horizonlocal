import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '@/types';

interface AuthState {
  user: User | null;
  token: string | null;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      setUser: (user) => set({ user }),
      setToken: (token) => {
        set({ token });
        if (typeof window !== 'undefined') {
          if (token) localStorage.setItem('auth_token', token);
          else localStorage.removeItem('auth_token');
        }
      },
      logout: () => {
        set({ user: null, token: null });
        if (typeof window !== 'undefined') localStorage.removeItem('auth_token');
      },
      isAuthenticated: () => !!get().token,
    }),
    {
      name: 'auth-store',
      partialize: (state) => ({ user: state.user, token: state.token }),
      skipHydration: true,
    }
  )
);
