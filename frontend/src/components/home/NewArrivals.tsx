'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { ArrowRight, ChevronLeft, ChevronRight, Sparkles, Star } from 'lucide-react';
import type { Product } from '@/types';

const GRADIENTS = [
  'from-amber-100 to-orange-200',
  'from-rose-100 to-pink-200',
  'from-emerald-100 to-teal-200',
  'from-stone-100 to-amber-200',
  'from-yellow-100 to-amber-200',
  'from-sky-100 to-blue-200',
  'from-orange-100 to-rose-200',
  'from-emerald-100 to-green-200',
];

const EMOJIS = ['🎁', '⭐', '🛍️', '✨', '🌟', '💫', '🎀', '🏷️'];

function formatCAD(amount: number) {
  return new Intl.NumberFormat('fr-CA', { style: 'currency', currency: 'CAD' }).format(amount);
}

export function NewArrivals({ products = [] }: { products?: Product[] }) {
  const scrollerRef = useRef<HTMLDivElement | null>(null);

  const scrollBy = (delta: number) => {
    scrollerRef.current?.scrollBy({ left: delta, behavior: 'smooth' });
  };

  if (products.length === 0) return null;

  return (
    <section className="py-14 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between flex-wrap gap-3 mb-7">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#1c61e7] uppercase tracking-wide mb-2">
              <Sparkles className="h-3.5 w-3.5" />
              Nouveautés
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-gray-900">
              Tout juste arrivés sur Horizon Local
            </h2>
            <p className="text-gray-600 mt-1">
              Les dernières créations de nos artisans québécois.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => scrollBy(-320)}
              aria-label="Faire défiler vers la gauche"
              className="hidden md:inline-flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white hover:bg-gray-100 text-gray-600 transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => scrollBy(320)}
              aria-label="Faire défiler vers la droite"
              className="hidden md:inline-flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white hover:bg-gray-100 text-gray-600 transition-colors"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
            <Link
              href="/shop?sort_by=created_at&sort_dir=desc"
              className="inline-flex items-center gap-1 text-sm font-semibold text-[#1c61e7] hover:underline"
            >
              Voir tout
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        <div
          ref={scrollerRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide snap-x pb-2 -mx-4 px-4"
        >
          {products.map((p, i) => {
            const img = p.images?.[0]?.url;
            const gradient = GRADIENTS[i % GRADIENTS.length];
            const emoji = EMOJIS[i % EMOJIS.length];
            const rating = p.average_rating ?? 4.5;
            const vendorName = p.vendor?.store_name ?? '';
            return (
              <Link
                key={p.id}
                href={`/shop/${p.slug}`}
                className="group flex-shrink-0 w-56 sm:w-64 bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
              >
                <div className={`relative aspect-square bg-gradient-to-br ${gradient} flex items-center justify-center overflow-hidden`}>
                  {img ? (
                    <img src={img} alt={p.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-6xl select-none" aria-hidden>{emoji}</span>
                  )}
                  <span className="absolute top-2 left-2 inline-flex items-center gap-1 bg-[#1c61e7] text-white text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded">
                    <Sparkles className="h-3 w-3" />
                    Nouveau
                  </span>
                </div>
                <div className="p-3">
                  <p className="text-xs text-gray-500 truncate">{vendorName}</p>
                  <h3 className="mt-1 text-sm font-semibold text-gray-900 line-clamp-2 min-h-[2.5rem]">
                    {p.name}
                  </h3>
                  <div className="mt-1 flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`h-3 w-3 ${s <= Math.round(rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-200'}`}
                      />
                    ))}
                    {p.reviews_count != null && p.reviews_count > 0 && (
                      <span className="text-[10px] text-gray-400 ml-1">({p.reviews_count})</span>
                    )}
                  </div>
                  <div className="mt-2 flex items-center justify-between gap-2">
                    <span className="text-base font-bold text-[#1c61e7]">{formatCAD(p.price)}</span>
                    {p.compare_price && p.compare_price > p.price && (
                      <span className="text-xs text-gray-400 line-through">{formatCAD(p.compare_price)}</span>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
