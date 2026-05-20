'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { X } from 'lucide-react';
import { Product } from '@/types';
import { PriceDisplay } from '@/components/ui/PriceDisplay';
import { StockBadge } from '@/components/ui/StockBadge';
import { Button } from '@/components/ui/Button';
import { useCart } from '@/hooks/useCart';

interface QuickViewProps {
  product: Product | null;
  onClose: () => void;
}

export function QuickView({ product, onClose }: QuickViewProps) {
  const { addToCart } = useCart();

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  if (!product) return null;

  const primaryImage = product.images?.find((img) => img.is_primary) || product.images?.[0];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white shadow hover:bg-gray-50 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-6">
          {/* Image */}
          <div className="aspect-square relative rounded-xl overflow-hidden bg-gray-50">
            {primaryImage ? (
              <Image
                src={primaryImage.url}
                alt={product.name}
                fill
                className="object-cover"
                sizes="300px"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-300">
                <svg className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex flex-col gap-3">
            {product.vendor && (
              <Link
                href={`/stores/${product.vendor.store_slug}`}
                className="text-sm text-[#1c61e7] font-medium hover:underline"
                onClick={onClose}
              >
                {product.vendor.store_name}
              </Link>
            )}
            <h2 className="text-lg font-bold text-gray-900">{product.name}</h2>
            <PriceDisplay price={product.price} comparePrice={product.compare_price} size="lg" />
            <StockBadge stock={product.stock} />
            {product.short_description && (
              <p className="text-sm text-gray-600">{product.short_description}</p>
            )}
            <div className="flex flex-col gap-2 mt-auto pt-4">
              <Button
                onClick={() => addToCart(product.id, undefined, 1)}
                disabled={product.stock === 0}
                fullWidth
              >
                Ajouter au panier
              </Button>
              <Link
                href={`/shop/${product.slug}`}
                className="text-center text-sm text-[#1c61e7] hover:underline"
                onClick={onClose}
              >
                Voir le produit complet
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
