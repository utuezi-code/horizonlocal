'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { loginUser, registerUser, logoutUser } from '@/lib/auth';

export function useAuth() {
  const { user, token, setUser, setToken, logout: storeLogout, isAuthenticated } = useAuthStore();
  const router = useRouter();

  const login = useCallback(
    async (email: string, password: string) => {
      const data = await loginUser(email, password);
      setToken(data.token);
      setUser(data.user);
      return data;
    },
    [setToken, setUser]
  );

  const register = useCallback(
    async (payload: {
      name: string;
      email: string;
      password: string;
      password_confirmation: string;
      is_vendor?: boolean;
      store_name?: string;
    }) => {
      const data = await registerUser(payload);
      setToken(data.token);
      setUser(data.user);
      return data;
    },
    [setToken, setUser]
  );

  const logout = useCallback(async () => {
    try {
      await logoutUser();
    } catch {
      // ignore errors on logout
    } finally {
      storeLogout();
      router.push('/login');
    }
  }, [storeLogout, router]);

  return { user, token, login, register, logout, isAuthenticated };
}
