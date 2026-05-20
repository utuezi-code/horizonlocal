'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { fetchCurrentUser } from '@/lib/auth';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { token, setUser } = useAuthStore();

  useEffect(() => {
    if (token) {
      fetchCurrentUser().then((user) => {
        if (user) setUser(user);
      });
    }
  }, [token, setUser]);

  return <>{children}</>;
}
