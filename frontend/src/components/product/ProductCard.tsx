'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, Scale, Eye, ShoppingCart } from 'lucide-react';
import { Product } from '@/types';
import { PriceDisplay } from '@/components/ui/PriceDisplay';
import { StockBadge } from '@/components/ui/StockBadge';
import { useCart } from '@/hooks/useCart';
import { cn } from '@/lib/utils';

interface ProductCardProps {
  product: Product;
  onQuickView?: (product: Product) => void;
  onCompare?: (product: Product) => void;
  onWishlist?: (product: Product) => void;
  isInWishlist?: boolean;
}

export function ProductCard({
  product,
  onQuickView,
  onCompare,
  onWishlist,
  isInWishlist = false,
}: ProductCardProps) {
  const [hovered, setHovered] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const { addToCart } = useCart();

  const primaryImage = product.images?.find((img) => img.is_primary) || product.images?.[0];
  const secondaryImage = product.images?.[1];

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setAddingToCart(true);
    try {
      await addToCart(product.id, undefined, 1);
    } catch {
      // Handle error
    } finally {
      setAddingToCart(false);
    }
  };

  return (
    <div
      className="group relative bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Image */}
      <Link href={`/shop/${product.slug}`} className="block relative aspect-square overflow-hidden bg-gray-50">
        {primaryImage ? (
          <Image
            src={hovered && secondaryImage ? secondaryImage.url : primaryImage.url}
            alt={primaryImage.alt_text || product.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300">
            <svg className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}

        {/* Discount badge */}
        {product.compare_price && product.compare_price > product.price && (
          <div className="absolute top-2 left-2 bg-[#f97316] text-white text-xs font-bold px-2 py-0.5 rounded">
            -{Math.round(((product.compare_price - product.price) / product.compare_price) * 100)}%
          </div>
        )}

        {/* Action buttons on hover */}
        <div
          className={cn(
            'absolute top-2 right-2 flex flex-col gap-1.5 transition-all duration-200',
            hovered ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'
          )}
        >
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onWishlist?.(product); }}
            className={cn(
              'p-2 rounded-full shadow-sm transition-colors',
              isInWishlist
                ? 'bg-red-50 text-red-500'
                : 'bg-white text-gray-500 hover:text-red-500'
            )}
            title="Ajouter aux favoris"
          >
            <Heart className={cn('h-4 w-4', isInWishlist && 'fill-red-500')} />
          </button>
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onCompare?.(product); }}
            className="p-2 rounded-full bg-white shadow-sm text-gray-500 hover:text-[#1c61e7] transition-colors"
            title="Comparer"
          >
            <Scale className="h-4 w-4" />
          </button>
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onQuickView?.(product); }}
            className="p-2 rounded-full bg-white shadow-sm text-gray-500 hover:text-[#1c61e7] transition-colors"
            title="Aperçu rapide"
          >
            <Eye className="h-4 w-4" />
          </button>
        </div>

        {/* Quick add overlay */}
        <div
          className={cn(
            'absolute bottom-0 left-0 right-0 transition-all duration-200',
            hovered ? 'opacity-100 translate-y-0' : 'opacity-100 translate-y-full'
          )}
        >
          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0 || addingToCart}
            className="w-full py-2.5 bg-[#1c61e7] text-white text-sm font-medium hover:bg-[#1a56d0] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
          >
            <ShoppingCart className="h-4 w-4" />
            {addingToCart ? 'Ajout...' : 'Ajouter au panier'}
          </button>
        </div>
      </Link>

      {/* Content */}
      <div className="p-3">
        {/* Vendor */}
        {product.vendor && (
          <Link
            href={`/stores/${product.vendor.store_slug}`}
            className="text-xs text-gray-500 hover:text-[#1c61e7] transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            {product.vendor.store_name}
          </Link>
        )}

        {/* Name */}
        <Link href={`/shop/${product.slug}`}>
          <h3 className="mt-1 text-sm font-medium text-gray-900 line-clamp-2 hover:text-[#1c61e7] transition-colors">
            {product.name}
          </h3>
        </Link>

        {/* Rating */}
        {product.average_rating !== undefined && (
          <div className="mt-1 flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <svg
                key={star}
                className={cn(
                  'h-3 w-3',
                  star <= Math.round(product.average_rating!)
                    ? 'text-yellow-400 fill-yellow-400'
                    : 'text-gray-200 fill-gray-200'
                )}
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
            {product.reviews_count !== undefined && (
              <span className="text-xs text-gray-400">({product.reviews_count})</span>
            )}
          </div>
        )}

        {/* Price + Stock */}
        <div className="mt-2 flex items-center justify-between">
          <PriceDisplay price={product.price} comparePrice={product.compare_price} size="sm" />
          <StockBadge stock={product.stock} />
        </div>
      </div>
    </div>
  );
}
