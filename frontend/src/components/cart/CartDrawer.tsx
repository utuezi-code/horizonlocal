'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { X, ShoppingBag } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { useCart } from '@/hooks/useCart';
import { CartItem } from './CartItem';
import { formatPrice } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

export function CartDrawer() {
  const { isOpen, closeCart } = useCartStore();
  const { cart } = useCart();

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeCart();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [closeCart]);

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  return (
    <>
      {/* Overlay */}
      <div
        className={cn(
          'fixed inset-0 z-40 bg-black/50 transition-opacity duration-300',
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        )}
        onClick={closeCart}
      />

      {/* Drawer */}
      <div
        className={cn(
          'fixed right-0 top-0 h-full w-full max-w-md z-50 bg-white shadow-2xl flex flex-col transition-transform duration-300',
          isOpen ? 'translate-x-0' : 'translate-x-full'
        )}
        role="dialog"
        aria-modal="true"
        aria-label="Panier"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-[#1c61e7]" />
            <h2 className="text-lg font-bold text-gray-900">Mon panier</h2>
            {cart && cart.items.length > 0 && (
              <span className="text-sm text-gray-500">({cart.items.length} article{cart.items.length > 1 ? 's' : ''})</span>
            )}
          </div>
          <button
            onClick={closeCart}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Fermer le panier"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-5 divide-y divide-gray-100">
          {!cart || cart.items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-12 text-center">
              <ShoppingBag className="h-16 w-16 text-gray-200 mb-4" />
              <p className="text-gray-500 font-medium">Votre panier est vide</p>
              <p className="text-sm text-gray-400 mt-1 mb-6">
                Découvrez nos produits et ajoutez-les à votre panier.
              </p>
              <Button variant="secondary" onClick={closeCart} className="w-full max-w-xs">
                <Link href="/shop" onClick={closeCart}>
                  Découvrir nos produits
                </Link>
              </Button>
            </div>
          ) : (
            cart.items.map((item) => <CartItem key={item.id} item={item} />)
          )}
        </div>

        {/* Footer */}
        {cart && cart.items.length > 0 && (
          <div className="px-5 py-4 border-t border-gray-100 space-y-3 bg-gray-50">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Sous-total</span>
              <span className="text-lg font-bold text-gray-900">{formatPrice(cart.total)}</span>
            </div>
            <p className="text-xs text-gray-500">
              Taxes et frais de livraison calculés à la caisse
            </p>
            <div className="flex flex-col gap-2">
              <Link href="/cart" onClick={closeCart} className="block">
                <Button variant="secondary" fullWidth>
                  Voir mon panier
                </Button>
              </Link>
              <Link href="/checkout" onClick={closeCart} className="block">
                <Button fullWidth>
                  Commander
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
