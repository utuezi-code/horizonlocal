'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles, ShoppingBag, Gift } from 'lucide-react';

interface Slide {
  eyebrow: string;
  title: string;
  highlight: string;
  description: string;
  cta: { label: string; href: string };
  gradient: string;
  icon: React.ReactNode;
  accentEmoji: string;
}

const slides: Slide[] = [
  {
    eyebrow: 'Nouvelle saison',
    title: 'Découvrez les meilleurs produits',
    highlight: 'fabriqués au Québec',
    description:
      'Plus de 5 000 produits soigneusement sélectionnés auprès de nos artisans et créateurs locaux.',
    cta: { label: 'Magasiner maintenant', href: '/shop' },
    gradient: 'from-[#1c61e7] via-[#1a56d0] to-[#1648b0]',
    icon: <Sparkles className="h-5 w-5" />,
    accentEmoji: '🍁',
  },
  {
    eyebrow: 'Économies exclusives',
    title: 'Jusqu’à 40 % de rabais sur',
    highlight: 'les nouveautés du printemps',
    description:
      'Profitez de nos offres saisonnières sur les marques québécoises. Stock limité — ne tardez pas.',
    cta: { label: 'Voir les promotions', href: '/promotions' },
    gradient: 'from-[#f97316] via-[#ea6c0a] to-[#c2410c]',
    icon: <Gift className="h-5 w-5" />,
    accentEmoji: '🎁',
  },
  {
    eyebrow: 'Boutiques locales',
    title: 'Soutenez les entrepreneurs',
    highlight: 'd’ici, partout au Québec',
    description:
      'Chaque achat fait directement vivre des familles québécoises. Découvrez nos 150+ boutiques.',
    cta: { label: 'Explorer les boutiques', href: '/stores' },
    gradient: 'from-emerald-700 via-emerald-800 to-slate-900',
    icon: <ShoppingBag className="h-5 w-5" />,
    accentEmoji: '🛍️',
  },
];

export function HeroCarousel() {
  const [index, setIndex] = useState(0);

  const goTo = useCallback((i: number) => setIndex(((i % slides.length) + slides.length) % slides.length), []);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section
      className="relative overflow-hidden"
      aria-label="Carrousel principal"
    >
      <div className="relative h-[420px] sm:h-[460px] lg:h-[520px]">
        {slides.map((slide, i) => (
          <div
            key={i}
            className={`absolute inset-0 bg-gradient-to-br ${slide.gradient} text-white transition-opacity duration-700 ${
              i === index ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
            aria-hidden={i !== index}
          >
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-10 left-10 w-64 h-64 rounded-full bg-white blur-3xl" />
              <div className="absolute bottom-10 right-10 w-80 h-80 rounded-full bg-white blur-3xl" />
            </div>
            <div className="absolute right-4 sm:right-10 top-1/2 -translate-y-1/2 text-[10rem] sm:text-[14rem] opacity-20 select-none">
              {slide.accentEmoji}
            </div>
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center">
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-2 bg-white/15 border border-white/25 rounded-full px-3 py-1 text-xs font-medium mb-5">
                  {slide.icon}
                  <span>{slide.eyebrow}</span>
                </div>
                <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-tight mb-5">
                  {slide.title}{' '}
                  <span className="text-[#fdba74]">{slide.highlight}</span>
                </h1>
                <p className="text-base sm:text-lg text-white/85 max-w-xl mb-7">
                  {slide.description}
                </p>
                <Link
                  href={slide.cta.href}
                  className="inline-flex items-center gap-2 bg-white text-gray-900 font-semibold px-6 py-3 rounded-xl shadow-lg hover:bg-gray-50 transition-colors"
                >
                  {slide.cta.label}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Dots */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-2 z-10">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            aria-label={`Aller à la diapositive ${i + 1}`}
            className={`h-2 rounded-full transition-all ${
              i === index ? 'w-8 bg-white' : 'w-2 bg-white/50 hover:bg-white/75'
            }`}
          />
        ))}
      </div>
    </section>
  );
}
