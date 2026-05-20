'use client';

import Image from 'next/image';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { CartItem as CartItemType } from '@/types';
import { formatPrice } from '@/lib/utils';
import { useCart } from '@/hooks/useCart';

interface CartItemProps {
  item: CartItemType;
}

export function CartItem({ item }: CartItemProps) {
  const { updateQuantity, removeFromCart } = useCart();
  const primaryImage = item.product.images?.find((img) => img.is_primary) || item.product.images?.[0];
  const price = item.variant?.price ?? item.product.price;

  return (
    <div className="flex gap-3 py-3">
      {/* Image */}
      <div className="relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-gray-50">
        {primaryImage ? (
          <Image
            src={primaryImage.url}
            alt={item.product.name}
            fill
            className="object-cover"
            sizes="64px"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14" />
            </svg>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 line-clamp-2">{item.product.name}</p>
        {item.product.vendor && (
          <p className="text-xs text-gray-500">{item.product.vendor.store_name}</p>
        )}
        <p className="text-sm font-bold text-[#1c61e7] mt-0.5">{formatPrice(price)}</p>

        {/* Quantity controls */}
        <div className="flex items-center gap-2 mt-1.5">
          <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
            <button
              onClick={() => {
                if (item.quantity > 1) updateQuantity(item.id, item.quantity - 1);
                else removeFromCart(item.id);
              }}
              className="p-1 hover:bg-gray-50 transition-colors"
              aria-label="Diminuer"
            >
              <Minus className="h-3 w-3 text-gray-600" />
            </button>
            <span className="px-2 text-sm font-medium text-gray-900 min-w-[1.5rem] text-center">
              {item.quantity}
            </span>
            <button
              onClick={() => updateQuantity(item.id, item.quantity + 1)}
              className="p-1 hover:bg-gray-50 transition-colors"
              aria-label="Augmenter"
            >
              <Plus className="h-3 w-3 text-gray-600" />
            </button>
          </div>
          <button
            onClick={() => removeFromCart(item.id)}
            className="p-1 text-gray-400 hover:text-red-500 transition-colors"
            aria-label="Supprimer"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Subtotal */}
      <div className="text-right flex-shrink-0">
        <p className="text-sm font-bold text-gray-900">{formatPrice(price * item.quantity)}</p>
      </div>
    </div>
  );
}
