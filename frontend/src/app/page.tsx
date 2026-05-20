import Link from 'next/link';
import { ArrowRight, ShieldCheck, Truck, Star, Users } from 'lucide-react';

const featuredCategories = [
  { name: 'Alimentation', slug: 'alimentation', emoji: '🥗' },
  { name: 'Mode & Vêtements', slug: 'mode', emoji: '👕' },
  { name: 'Maison & Déco', slug: 'maison', emoji: '🏡' },
  { name: 'Beauté & Santé', slug: 'beaute', emoji: '💄' },
  { name: 'Électronique', slug: 'electronique', emoji: '💻' },
  { name: 'Sport & Loisirs', slug: 'sport', emoji: '⚽' },
  { name: 'Bébé & Enfants', slug: 'bebe', emoji: '🧸' },
  { name: 'Arts & Artisanat', slug: 'arts', emoji: '🎨' },
  { name: 'Jardin & Extérieur', slug: 'jardin', emoji: '🌱' },
];

const stats = [
  { label: 'Vendeurs actifs', value: '150+' },
  { label: 'Produits disponibles', value: '5 000+' },
  { label: 'Clients satisfaits', value: '10 000+' },
  { label: 'Régions du Québec', value: '17' },
];

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-[#1c61e7] to-[#1648b0] text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-64 h-64 rounded-full bg-white blur-3xl" />
          <div className="absolute bottom-10 right-10 w-80 h-80 rounded-full bg-[#f97316] blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-sm mb-6">
              <Star className="h-4 w-4 text-[#f97316]" />
              <span>Marché multi-vendeurs 100% québécois</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              Découvrez les{' '}
              <span className="text-[#f97316]">meilleurs produits</span>{' '}
              du Québec
            </h1>
            <p className="text-lg text-blue-100 mb-8 max-w-lg">
              Soutenez les entrepreneurs locaux et trouvez des produits uniques fabriqués au Québec,
              livrés directement à votre porte.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 bg-[#f97316] hover:bg-[#ea6c0a] text-white font-semibold px-6 py-3 rounded-xl transition-colors shadow-lg"
              >
                Découvrir nos produits
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/stores"
                className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/30 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
              >
                <Users className="h-4 w-4" />
                Nos boutiques
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl font-bold text-[#1c61e7]">{stat.value}</div>
                <div className="text-sm text-gray-600 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900">Catégories</h2>
            <p className="text-gray-600 mt-2">Explorez notre sélection de produits québécois</p>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-9 gap-4">
            {featuredCategories.map((cat) => (
              <Link
                key={cat.slug}
                href={`/product-category/${cat.slug}`}
                className="group flex flex-col items-center gap-2 bg-white rounded-xl p-4 border border-gray-100 hover:border-[#1c61e7] hover:shadow-md transition-all"
              >
                <span className="text-3xl">{cat.emoji}</span>
                <span className="text-xs font-medium text-gray-700 text-center group-hover:text-[#1c61e7] transition-colors">
                  {cat.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Produits vedettes</h2>
              <p className="text-gray-600 mt-1">Sélection de produits mis en avant par nos vendeurs</p>
            </div>
            <Link
              href="/shop?featured=1"
              className="hidden sm:inline-flex items-center gap-1 text-[#1c61e7] font-medium hover:underline text-sm"
            >
              Voir tout <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {['🍁', '🎨', '🧴', '👟', '🍫', '🌿', '🏺', '👜'].map((emoji, i) => (
              <div
                key={i}
                className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                  <span className="text-4xl">{emoji}</span>
                </div>
                <div className="p-3">
                  <p className="text-xs text-gray-500">Boutique locale</p>
                  <p className="text-sm font-medium text-gray-900 mt-1">Produit québécois #{i + 1}</p>
                  <p className="text-sm font-bold text-[#1c61e7] mt-1">
                    {new Intl.NumberFormat('fr-CA', { style: 'currency', currency: 'CAD' }).format(
                      19.99 + i * 5
                    )}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Vendor stores */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Nos boutiques partenaires</h2>
              <p className="text-gray-600 mt-1">Des entrepreneurs passionnés de partout au Québec</p>
            </div>
            <Link
              href="/stores"
              className="hidden sm:inline-flex items-center gap-1 text-[#1c61e7] font-medium hover:underline text-sm"
            >
              Toutes les boutiques <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {['Saveurs du Nord', 'Mode Montréal', 'Artisans Québécois'].map((name) => (
              <div
                key={name}
                className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="h-24 bg-gradient-to-r from-[#1c61e7] to-[#1648b0]" />
                <div className="relative px-4 pb-4">
                  <div className="absolute -top-8 left-4 w-16 h-16 rounded-full border-4 border-white bg-[#eff6ff] flex items-center justify-center shadow-md">
                    <span className="text-2xl font-bold text-[#1c61e7]">{name.charAt(0)}</span>
                  </div>
                  <div className="pt-10">
                    <h3 className="font-bold text-gray-900">{name}</h3>
                    <p className="text-xs text-gray-500 mt-0.5">Québec, QC</p>
                    <p className="text-xs text-gray-600 mt-2">Boutique locale proposant des produits artisanaux de qualité.</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Promo section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#f97316] to-[#ea6c0a] text-white p-8 lg:p-12">
            <div className="absolute right-0 top-0 bottom-0 opacity-10">
              <div className="w-64 h-64 rounded-full bg-white blur-2xl translate-x-1/2 -translate-y-1/4" />
            </div>
            <div className="relative max-w-lg">
              <div className="inline-flex items-center gap-2 bg-white/20 rounded-full px-3 py-1 text-sm font-medium mb-4">
                🎉 Offre du mois
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold mb-3">
                20% de rabais sur toute la boutique
              </h2>
              <p className="text-orange-100 mb-6">
                Profitez de notre offre spéciale du mois de mai. Utilisez le code{' '}
                <strong className="bg-white/20 px-2 py-0.5 rounded font-mono">PRINTEMPS20</strong>{' '}
                à la caisse.
              </p>
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 bg-white text-[#f97316] font-bold px-6 py-3 rounded-xl hover:bg-orange-50 transition-colors shadow"
              >
                Profiter de l&apos;offre <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Trust badges */}
      <section className="py-12 bg-gray-50 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[#eff6ff] flex items-center justify-center">
                <Truck className="h-6 w-6 text-[#1c61e7]" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Livraison au Québec</h3>
                <p className="text-sm text-gray-600">Livraison partout en province</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[#eff6ff] flex items-center justify-center">
                <ShieldCheck className="h-6 w-6 text-[#1c61e7]" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Paiement sécurisé</h3>
                <p className="text-sm text-gray-600">Transactions protégées par Stripe</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[#eff6ff] flex items-center justify-center">
                <Star className="h-6 w-6 text-[#1c61e7]" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">100% québécois</h3>
                <p className="text-sm text-gray-600">Entreprises locales vérifiées</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
