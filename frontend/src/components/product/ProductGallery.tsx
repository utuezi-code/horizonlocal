'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ProductImage } from '@/types';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ProductGalleryProps {
  images: ProductImage[];
  productName: string;
}

export function ProductGallery({ images, productName }: ProductGalleryProps) {
  const sortedImages = [...images].sort((a, b) => a.sort_order - b.sort_order);
  const [activeIndex, setActiveIndex] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });

  const activeImage = sortedImages[activeIndex];

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePos({ x, y });
  };

  const prev = () => setActiveIndex((i) => (i === 0 ? sortedImages.length - 1 : i - 1));
  const next = () => setActiveIndex((i) => (i === sortedImages.length - 1 ? 0 : i + 1));

  if (sortedImages.length === 0) {
    return (
      <div className="aspect-square rounded-xl bg-gray-100 flex items-center justify-center">
        <svg className="h-24 w-24 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Main image */}
      <div
        className="relative aspect-square rounded-xl overflow-hidden bg-gray-50 cursor-zoom-in"
        onMouseEnter={() => setZoomed(true)}
        onMouseLeave={() => setZoomed(false)}
        onMouseMove={handleMouseMove}
      >
        {activeImage && (
          <Image
            src={activeImage.url}
            alt={activeImage.alt_text || productName}
            fill
            className={cn(
              'object-contain transition-transform duration-300',
              zoomed && 'scale-150'
            )}
            style={
              zoomed
                ? { transformOrigin: `${mousePos.x}% ${mousePos.y}%` }
                : {}
            }
            sizes="(max-width: 768px) 100vw, 50vw"
            priority
          />
        )}

        {/* Navigation arrows */}
        {sortedImages.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 shadow hover:bg-white transition-colors"
            >
              <ChevronLeft className="h-4 w-4 text-gray-700" />
            </button>
            <button
              onClick={next}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 shadow hover:bg-white transition-colors"
            >
              <ChevronRight className="h-4 w-4 text-gray-700" />
            </button>
          </>
        )}

        {/* Image counter */}
        {sortedImages.length > 1 && (
          <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-0.5 rounded-full">
            {activeIndex + 1} / {sortedImages.length}
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {sortedImages.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {sortedImages.map((img, i) => (
            <button
              key={img.id}
              onClick={() => setActiveIndex(i)}
              className={cn(
                'flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all',
                i === activeIndex
                  ? 'border-[#1c61e7]'
                  : 'border-transparent hover:border-gray-300'
              )}
            >
              <Image
                src={img.url}
                alt={img.alt_text || `${productName} ${i + 1}`}
                width={64}
                height={64}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
