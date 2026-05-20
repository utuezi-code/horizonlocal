import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Cart } from '@/types';

interface CartState {
  cart: Cart | null;
  isOpen: boolean;
  setCart: (cart: Cart | null) => void;
  openCart: () => void;
  closeCart: () => void;
  getItemCount: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      cart: null,
      isOpen: false,
      setCart: (cart) => set({ cart }),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      getItemCount: () =>
        get().cart?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0,
    }),
    {
      name: 'cart-store',
      partialize: (state) => ({ cart: state.cart }),
      skipHydration: true,
    }
  )
);
