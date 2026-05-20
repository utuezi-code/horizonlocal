'use client';

import { useEffect } from 'react';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';

/**
 * Rehydrates Zustand persist stores from localStorage after the initial
 * SSR render. Without this, server and client render with the same empty
 * initial state (no hydration mismatch), and React mounts correctly.
 * localStorage values are applied only after mount, avoiding broken buttons.
 */
export function StoreHydration() {
  useEffect(() => {
    useCartStore.persist.rehydrate();
    useAuthStore.persist.rehydrate();
  }, []);

  return null;
}
