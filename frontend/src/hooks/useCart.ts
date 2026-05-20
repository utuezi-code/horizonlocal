'use client';

import { useCallback } from 'react';
import { useCartStore } from '@/store/cartStore';
import api from '@/lib/api';
import { Cart } from '@/types';

export function useCart() {
  const { cart, isOpen, setCart, openCart, closeCart, getItemCount } = useCartStore();

  const fetchCart = useCallback(async () => {
    try {
      const response = await api.get<Cart>('/cart');
      setCart(response.data);
    } catch {
      // Cart not available (unauthenticated)
    }
  }, [setCart]);

  const addToCart = useCallback(
    async (productId: number, variantId?: number, quantity = 1) => {
      const response = await api.post<Cart>('/cart/items', {
        product_id: productId,
        variant_id: variantId,
        quantity,
      });
      setCart(response.data);
      openCart();
    },
    [setCart, openCart]
  );

  const removeFromCart = useCallback(
    async (itemId: number) => {
      const response = await api.delete<Cart>(`/cart/items/${itemId}`);
      setCart(response.data);
    },
    [setCart]
  );

  const updateQuantity = useCallback(
    async (itemId: number, quantity: number) => {
      const response = await api.patch<Cart>(`/cart/items/${itemId}`, { quantity });
      setCart(response.data);
    },
    [setCart]
  );

  const clearCart = useCallback(async () => {
    await api.delete('/cart');
    setCart(null);
  }, [setCart]);

  return {
    cart,
    isOpen,
    openCart,
    closeCart,
    fetchCart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getItemCount,
  };
}
