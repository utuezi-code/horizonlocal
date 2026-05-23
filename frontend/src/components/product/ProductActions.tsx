'use client';

import { useState } from 'react';
import { Heart, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useCart } from '@/hooks/useCart';
import { useWishlist } from '@/hooks/useWishlist';
import type { Product } from '@/types';

export function ProductActions({ product }: { product: Product }) {
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { addToCart } = useCart();
  const { addToWishlist, isInWishlist } = useWishlist();

  // Respect manage_stock: if false or undefined, always allow adding to cart
  const isOutOfStock = product.manage_stock === true && product.stock === 0;

  const handleAddToCart = async () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    if (!token) {
      window.location.href = '/login';
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await addToCart(product.id, undefined, quantity);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setError(axiosErr?.response?.data?.message ?? 'Erreur lors de l\'ajout au panier. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium text-gray-700">Quantité :</span>
        <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
          <button
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="px-3 py-2 hover:bg-gray-50 text-gray-600 font-bold transition-colors text-lg leading-none"
          >
            −
          </button>
          <span className="px-4 py-2 text-center font-medium min-w-[3rem]">{quantity}</span>
          <button
            onClick={() => setQuantity((q) => q + 1)}
            disabled={isOutOfStock}
            className="px-3 py-2 hover:bg-gray-50 text-gray-600 font-bold transition-colors text-lg leading-none disabled:opacity-40"
          >
            +
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          {error}
        </div>
      )}

      <div className="flex gap-3">
        <Button
          onClick={handleAddToCart}
          disabled={isOutOfStock || loading}
          size="lg"
          className="flex-1"
        >
          {loading ? 'Ajout en cours…' : isOutOfStock ? 'Rupture de stock' : 'Ajouter au panier'}
        </Button>
        <button
          onClick={() => addToWishlist(product.id)}
          className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl border transition-colors ${
            isInWishlist(product.id)
              ? 'border-red-300 bg-red-50 text-red-500'
              : 'border-gray-200 hover:border-[#1c61e7] text-gray-600 hover:text-[#1c61e7]'
          }`}
          title={isInWishlist(product.id) ? 'Retirer des favoris' : 'Ajouter aux favoris'}
        >
          <Heart className={`h-5 w-5 ${isInWishlist(product.id) ? 'fill-red-500' : ''}`} />
        </button>
      </div>
    </div>
  );
}
