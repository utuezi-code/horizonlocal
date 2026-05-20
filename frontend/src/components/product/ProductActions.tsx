'use client';

import { useState } from 'react';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useCart } from '@/hooks/useCart';
import { useWishlist } from '@/hooks/useWishlist';
import type { Product } from '@/types';

export function ProductActions({ product }: { product: Product }) {
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const { addToCart } = useCart();
  const { addToWishlist, isInWishlist } = useWishlist();

  const handleAddToCart = async () => {
    setLoading(true);
    try {
      await addToCart(product.id, undefined, quantity);
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
            onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
            disabled={product.stock === 0}
            className="px-3 py-2 hover:bg-gray-50 text-gray-600 font-bold transition-colors text-lg leading-none disabled:opacity-40"
          >
            +
          </button>
        </div>
      </div>

      <div className="flex gap-3">
        <Button
          onClick={handleAddToCart}
          disabled={product.stock === 0 || loading}
          size="lg"
          className="flex-1"
        >
          {loading ? 'Ajout en cours…' : product.stock === 0 ? 'Rupture de stock' : 'Ajouter au panier'}
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
