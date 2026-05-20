import Link from 'next/link';
import { Countdown } from '@/components/ui/Countdown';
import { Tag } from 'lucide-react';

const mockPromotions = [
  {
    id: 1,
    title: 'Printemps en fleurs',
    description: '20% de rabais sur tous les produits de beauté et santé.',
    code: 'PRINTEMPS20',
    discount_type: 'percentage' as const,
    discount_value: 20,
    ends_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    color: 'from-pink-500 to-rose-500',
  },
  {
    id: 2,
    title: 'Livraison gratuite',
    description: 'Livraison offerte sur toutes les commandes de 50 $ et plus.',
    code: 'LIVRAISONGRAT',
    discount_type: 'free_shipping' as const,
    discount_value: 0,
    ends_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    color: 'from-[#1c61e7] to-[#1648b0]',
  },
  {
    id: 3,
    title: 'Fête des mères',
    description: '15% de rabais sur une sélection de cadeaux.',
    code: 'MAMAN15',
    discount_type: 'percentage' as const,
    discount_value: 15,
    ends_at: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    color: 'from-purple-500 to-indigo-500',
  },
];

export default function PromotionsPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-gray-900">Promotions en cours</h1>
        <p className="text-gray-600 mt-2">Profitez de nos offres exclusives sur les produits québécois</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockPromotions.map((promo) => (
          <div
            key={promo.id}
            className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-lg transition-shadow"
          >
            {/* Header */}
            <div className={`bg-gradient-to-r ${promo.color} p-6 text-white`}>
              <div className="flex items-center gap-2 mb-2">
                <Tag className="h-5 w-5" />
                <span className="text-sm font-medium opacity-90">Promotion</span>
              </div>
              <h2 className="text-xl font-bold">{promo.title}</h2>
              {promo.discount_value > 0 && (
                <div className="mt-2 text-4xl font-extrabold">
                  {promo.discount_type === 'percentage'
                    ? `-${promo.discount_value}%`
                    : `-${new Intl.NumberFormat('fr-CA', { style: 'currency', currency: 'CAD' }).format(promo.discount_value)}`}
                </div>
              )}
              {promo.discount_type === 'free_shipping' && (
                <div className="mt-2 text-2xl font-extrabold">Livraison gratuite</div>
              )}
            </div>

            {/* Body */}
            <div className="p-5 space-y-4">
              <p className="text-gray-600 text-sm">{promo.description}</p>

              {/* Code */}
              <div className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-3">
                <span className="text-sm text-gray-500">Code promo :</span>
                <code className="font-mono font-bold text-[#1c61e7] tracking-wider">
                  {promo.code}
                </code>
              </div>

              {/* Countdown */}
              <div>
                <p className="text-xs text-gray-500 mb-2">Expire dans :</p>
                <Countdown endsAt={promo.ends_at} />
              </div>

              <Link
                href={`/shop?promo=${promo.code}`}
                className="block w-full text-center bg-[#1c61e7] text-white font-medium py-2.5 rounded-xl hover:bg-[#1a56d0] transition-colors"
              >
                Utiliser cette offre
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
