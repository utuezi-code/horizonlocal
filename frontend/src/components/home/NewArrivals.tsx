'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { ArrowRight, ChevronLeft, ChevronRight, Sparkles, ShoppingCart, Star } from 'lucide-react';

interface NewProduct {
  slug: string;
  name: string;
  vendor: string;
  price: number;
  emoji: string;
  gradient: string;
}

const newProducts: NewProduct[] = [
  { slug: 'sirop-erable-bio', name: 'Sirop d’érable biologique 500 ml', vendor: 'Érablière du Nord', price: 18.99, emoji: '🍁', gradient: 'from-amber-100 to-orange-200' },
  { slug: 'tuque-laine-merinos', name: 'Tuque en laine mérinos tricotée à la main', vendor: 'Tricot Boréal', price: 39.50, emoji: '🧶', gradient: 'from-rose-100 to-pink-200' },
  { slug: 'savon-artisanal', name: 'Savon artisanal au sapin baumier', vendor: 'Forêt & Sens', price: 9.95, emoji: '🧼', gradient: 'from-emerald-100 to-teal-200' },
  { slug: 'mug-ceramique', name: 'Tasse en céramique fait main', vendor: 'Atelier Argile', price: 24.00, emoji: '☕', gradient: 'from-stone-100 to-amber-200' },
  { slug: 'chandelle-cire-soya', name: 'Chandelle en cire de soya — Forêt boréale', vendor: 'Cire & Mèche', price: 22.50, emoji: '🕯️', gradient: 'from-yellow-100 to-amber-200' },
  { slug: 'sac-toile-recyclee', name: 'Sac fourre-tout en toile recyclée', vendor: 'Tissus d’ici', price: 32.00, emoji: '👜', gradient: 'from-sky-100 to-blue-200' },
  { slug: 'chocolat-noir-fin', name: 'Tablette de chocolat noir 75 % cacao', vendor: 'Cacao Local', price: 8.75, emoji: '🍫', gradient: 'from-orange-100 to-rose-200' },
  { slug: 'huile-essentielle-sapin', name: 'Huile essentielle de sapin du Québec', vendor: 'Aromathèque', price: 14.25, emoji: '🌲', gradient: 'from-emerald-100 to-green-200' },
];

function formatCAD(amount: number) {
  return new Intl.NumberFormat('fr-CA', { style: 'currency', currency: 'CAD' }).format(amount);
}

export function NewArrivals() {
  const scrollerRef = useRef<HTMLDivElement | null>(null);

  const scrollBy = (delta: number) => {
    scrollerRef.current?.scrollBy({ left: delta, behavior: 'smooth' });
  };

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
              href="/shop?sort=newest"
              className="inline-flex items-center gap-1 text-sm font-semibold text-[#1c61e7] hover:underline"
            >
              Voir tout
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        <div
          ref={scrollerRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide snap-x-smooth pb-2 -mx-4 px-4"
        >
          {newProducts.map((p) => (
            <Link
              key={p.slug}
              href={`/shop/${p.slug}`}
              className="group flex-shrink-0 w-56 sm:w-64 bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
            >
              <div className={`relative aspect-square bg-gradient-to-br ${p.gradient} flex items-center justify-center`}>
                <span className="text-6xl select-none" aria-hidden>
                  {p.emoji}
                </span>
                <span className="absolute top-2 left-2 inline-flex items-center gap-1 bg-[#1c61e7] text-white text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded">
                  <Sparkles className="h-3 w-3" />
                  Nouveau
                </span>
              </div>
              <div className="p-3">
                <p className="text-xs text-gray-500 truncate">{p.vendor}</p>
                <h3 className="mt-1 text-sm font-semibold text-gray-900 line-clamp-2 min-h-[2.5rem]">
                  {p.name}
                </h3>
                <div className="mt-1 flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={`h-3 w-3 ${s <= 4 ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-200'}`}
                    />
                  ))}
                  <span className="text-[10px] text-gray-400 ml-1">(4,5)</span>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-base font-bold text-[#1c61e7]">{formatCAD(p.price)}</span>
                  <span
                    className="opacity-0 group-hover:opacity-100 transition-opacity inline-flex items-center gap-1 text-xs font-medium text-white bg-[#1c61e7] px-2 py-1 rounded"
                  >
                    <ShoppingCart className="h-3 w-3" />
                    Ajouter
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
