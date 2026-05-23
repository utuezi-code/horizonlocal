import Link from 'next/link';
import { Tag, ShoppingBag } from 'lucide-react';
import { Countdown } from '@/components/ui/Countdown';

const GRADIENTS = [
  'from-pink-500 to-rose-500',
  'from-[#1c61e7] to-[#1648b0]',
  'from-purple-500 to-indigo-500',
  'from-emerald-500 to-teal-600',
  'from-orange-500 to-amber-600',
];

async function getPromotions() {
  try {
    const apiBase = process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api';
    const res = await fetch(`${apiBase}/promotions`, { cache: 'no-store' });
    if (!res.ok) return [];
    const json = await res.json();
    return Array.isArray(json) ? json : (json.data ?? []);
  } catch {
    return [];
  }
}

export default async function PromotionsPage() {
  const promotions = await getPromotions();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-gray-900">Promotions en cours</h1>
        <p className="text-gray-600 mt-2">Profitez de nos offres exclusives sur les produits québécois</p>
      </div>

      {promotions.length === 0 ? (
        <div className="text-center py-16">
          <ShoppingBag className="mx-auto h-12 w-12 text-gray-200 mb-4" />
          <p className="text-gray-500 mb-4">Aucune promotion en ce moment. Revenez bientôt !</p>
          <Link href="/shop" className="inline-flex items-center gap-2 bg-[#1c61e7] text-white font-semibold px-5 py-2.5 rounded-xl hover:bg-[#1648b0] transition-colors">
            Voir tous les produits
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {promotions.map((promo: any, i: number) => (
            <div key={promo.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-lg transition-shadow">
              <div className={`bg-gradient-to-r ${GRADIENTS[i % GRADIENTS.length]} p-6 text-white`}>
                <div className="flex items-center gap-2 mb-2">
                  <Tag className="h-5 w-5" />
                  <span className="text-sm font-medium opacity-90">Promotion</span>
                </div>
                <h2 className="text-xl font-bold">{promo.title}</h2>
                {promo.discount_type === 'percentage' && Number(promo.discount_value) > 0 && (
                  <div className="mt-2 text-4xl font-extrabold">-{promo.discount_value}%</div>
                )}
                {promo.discount_type === 'fixed' && Number(promo.discount_value) > 0 && (
                  <div className="mt-2 text-4xl font-extrabold">
                    -{new Intl.NumberFormat('fr-CA', { style: 'currency', currency: 'CAD' }).format(promo.discount_value)}
                  </div>
                )}
                {promo.discount_type === 'free_shipping' && (
                  <div className="mt-2 text-2xl font-extrabold">Livraison gratuite</div>
                )}
              </div>

              <div className="p-5 space-y-4">
                {promo.description && <p className="text-gray-600 text-sm">{promo.description}</p>}

                {promo.code && (
                  <div className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-3">
                    <span className="text-sm text-gray-500">Code promo :</span>
                    <code className="font-mono font-bold text-[#1c61e7] tracking-wider">{promo.code}</code>
                  </div>
                )}

                {promo.ends_at && (
                  <div>
                    <p className="text-xs text-gray-500 mb-2">Expire dans :</p>
                    <Countdown endsAt={promo.ends_at} />
                  </div>
                )}

                <Link
                  href="/shop"
                  className="block w-full text-center bg-[#1c61e7] text-white font-medium py-2.5 rounded-xl hover:bg-[#1a56d0] transition-colors"
                >
                  Utiliser cette offre
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
