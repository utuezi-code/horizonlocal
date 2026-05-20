'use client';

import { useState } from 'react';
import { Check, Copy, Tag } from 'lucide-react';

interface PromoCode {
  emoji: string;
  code: string;
  discountLabel: string;
  description: string;
  expiry: string;
  variant: 'orange' | 'blue' | 'green' | 'purple';
}

const promoCodes: PromoCode[] = [
  {
    emoji: '🌷',
    code: 'PRINTEMPS20',
    discountLabel: '20 % de rabais',
    description: 'Sur toute la boutique, sans minimum d’achat.',
    expiry: '31 mai 2026',
    variant: 'orange',
  },
  {
    emoji: '🚚',
    code: 'LIVRAISON',
    discountLabel: 'Livraison gratuite',
    description: 'Frais de livraison offerts dès 50 $ d’achat.',
    expiry: '15 juin 2026',
    variant: 'blue',
  },
  {
    emoji: '🍁',
    code: 'LOCAL10',
    discountLabel: '10 $ de rabais',
    description: 'À l’achat d’un produit chez un artisan québécois.',
    expiry: '30 juin 2026',
    variant: 'green',
  },
  {
    emoji: '🎉',
    code: 'BIENVENUE15',
    discountLabel: '15 % de rabais',
    description: 'Réservé aux nouveaux clients sur leur première commande.',
    expiry: '31 déc. 2026',
    variant: 'purple',
  },
];

const variants: Record<
  PromoCode['variant'],
  { card: string; chip: string; button: string; ring: string }
> = {
  orange: {
    card: 'bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200',
    chip: 'bg-orange-100 text-orange-700',
    button: 'bg-[#f97316] hover:bg-[#ea6c0a] text-white',
    ring: 'ring-orange-300',
  },
  blue: {
    card: 'bg-gradient-to-br from-blue-50 to-sky-50 border-blue-200',
    chip: 'bg-blue-100 text-blue-700',
    button: 'bg-[#1c61e7] hover:bg-[#1a56d0] text-white',
    ring: 'ring-blue-300',
  },
  green: {
    card: 'bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200',
    chip: 'bg-emerald-100 text-emerald-700',
    button: 'bg-emerald-600 hover:bg-emerald-700 text-white',
    ring: 'ring-emerald-300',
  },
  purple: {
    card: 'bg-gradient-to-br from-violet-50 to-purple-50 border-violet-200',
    chip: 'bg-violet-100 text-violet-700',
    button: 'bg-violet-600 hover:bg-violet-700 text-white',
    ring: 'ring-violet-300',
  },
};

export function PromoCodes() {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const copy = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      setTimeout(() => setCopiedCode((prev) => (prev === code ? null : prev)), 2000);
    } catch {
      // Clipboard unavailable; ignore.
    }
  };

  return (
    <section className="py-14 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between flex-wrap gap-3 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#f97316] uppercase tracking-wide mb-2">
              <Tag className="h-3.5 w-3.5" />
              Codes promo
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-gray-900">
              Économisez avec nos codes promo
            </h2>
            <p className="text-gray-600 mt-1">
              Cliquez sur un code pour le copier puis utilisez-le à la caisse.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {promoCodes.map((promo) => {
            const v = variants[promo.variant];
            const isCopied = copiedCode === promo.code;
            return (
              <div
                key={promo.code}
                className={`relative rounded-2xl border p-5 flex flex-col transition-shadow hover:shadow-md ${v.card}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <span className="text-3xl" aria-hidden>
                    {promo.emoji}
                  </span>
                  <span
                    className={`text-xs font-bold px-2 py-1 rounded-full ${v.chip}`}
                  >
                    {promo.discountLabel}
                  </span>
                </div>
                <p className="text-sm text-gray-700 mb-4 min-h-[3rem]">{promo.description}</p>

                <button
                  type="button"
                  onClick={() => copy(promo.code)}
                  className={`group flex items-center justify-between gap-2 bg-white/80 backdrop-blur rounded-lg border border-dashed border-gray-300 px-3 py-2 mb-4 cursor-pointer hover:ring-2 ${v.ring} transition-all`}
                  aria-label={`Copier le code ${promo.code}`}
                >
                  <span className="font-mono font-bold text-base text-gray-900 tracking-wider">
                    {promo.code}
                  </span>
                  {isCopied ? (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600">
                      <Check className="h-3.5 w-3.5" />
                      Copié !
                    </span>
                  ) : (
                    <Copy className="h-4 w-4 text-gray-400 group-hover:text-gray-600" />
                  )}
                </button>

                <div className="flex items-center justify-between mt-auto">
                  <span className="text-xs text-gray-500">Expire le {promo.expiry}</span>
                  <button
                    type="button"
                    onClick={() => copy(promo.code)}
                    className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${v.button}`}
                  >
                    {isCopied ? 'Copié !' : 'Copier le code'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
