'use client';

import { useState, useCallback } from 'react';
import api from '@/lib/api';
import { Product } from '@/types';

export function useWishlist() {
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchWishlist = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get<Product[]>('/wishlist');
      setWishlist(response.data);
    } catch {
      // Not authenticated or no wishlist
    } finally {
      setLoading(false);
    }
  }, []);

  const addToWishlist = useCallback(async (productId: number) => {
    await api.post('/wishlist', { product_id: productId });
    await fetchWishlist();
  }, [fetchWishlist]);

  const removeFromWishlist = useCallback(async (productId: number) => {
    await api.delete(`/wishlist/${productId}`);
    setWishlist((prev) => prev.filter((p) => p.id !== productId));
  }, []);

  const isInWishlist = useCallback(
    (productId: number) => wishlist.some((p) => p.id === productId),
    [wishlist]
  );

  return { wishlist, loading, fetchWishlist, addToWishlist, removeFromWishlist, isInWishlist };
}
