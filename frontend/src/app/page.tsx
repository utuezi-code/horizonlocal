import Link from 'next/link';
import {
  ArrowRight,
  ShieldCheck,
  Truck,
  Star,
  Users,
  Flame,
  MapPin,
  Store,
} from 'lucide-react';
import { HeroCarousel } from '@/components/home/HeroCarousel';
import { PromoCodes } from '@/components/home/PromoCodes';
import { NewArrivals } from '@/components/home/NewArrivals';
import { NewsletterForm } from '@/components/home/NewsletterForm';
import { Countdown } from '@/components/ui/Countdown';

const quickCategories = [
  { name: 'Alimentation', slug: 'alimentation', emoji: '🥗', color: 'from-emerald-100 to-emerald-200' },
  { name: 'Mode', slug: 'mode', emoji: '👕', color: 'from-rose-100 to-rose-200' },
  { name: 'Maison', slug: 'maison', emoji: '🏡', color: 'from-amber-100 to-amber-200' },
  { name: 'Beauté', slug: 'beaute', emoji: '💄', color: 'from-pink-100 to-pink-200' },
  { name: 'Électronique', slug: 'electronique', emoji: '💻', color: 'from-blue-100 to-blue-200' },
  { name: 'Artisanat', slug: 'arts', emoji: '🎨', color: 'from-violet-100 to-violet-200' },
];

const featuredCategories = [
  { name: 'Alimentation', slug: 'alimentation', emoji: '🥗', count: 412, gradient: 'from-emerald-500 to-emerald-700' },
  { name: 'Mode & Vêtements', slug: 'mode', emoji: '👕', count: 738, gradient: 'from-rose-500 to-rose-700' },
  { name: 'Maison & Déco', slug: 'maison', emoji: '🏡', count: 524, gradient: 'from-amber-500 to-orange-600' },
  { name: 'Beauté & Santé', slug: 'beaute', emoji: '💄', count: 296, gradient: 'from-pink-500 to-fuchsia-600' },
  { name: 'Électronique', slug: 'electronique', emoji: '💻', count: 184, gradient: 'from-blue-500 to-indigo-600' },
  { name: 'Sport & Loisirs', slug: 'sport', emoji: '⚽', count: 267, gradient: 'from-cyan-500 to-blue-600' },
  { name: 'Bébé & Enfants', slug: 'bebe', emoji: '🧸', count: 154, gradient: 'from-yellow-500 to-orange-500' },
  { name: 'Arts & Artisanat', slug: 'arts', emoji: '🎨', count: 389, gradient: 'from-violet-500 to-purple-700' },
  { name: 'Jardin & Extérieur', slug: 'jardin', emoji: '🌱', count: 142, gradient: 'from-green-500 to-emerald-700' },
];

const vendors = [
  { slug: 'saveurs-du-nord', name: 'Saveurs du Nord', city: 'Saguenay, QC', products: 86, gradient: 'from-emerald-600 to-teal-700' },
  { slug: 'mode-montreal', name: 'Mode Montréal', city: 'Montréal, QC', products: 142, gradient: 'from-rose-600 to-fuchsia-700' },
  { slug: 'artisans-quebecois', name: 'Artisans Québécois', city: 'Québec, QC', products: 213, gradient: 'from-amber-500 to-orange-700' },
];

function formatCAD(amount: number) {
  return new Intl.NumberFormat('fr-CA', { style: 'currency', currency: 'CAD' }).format(amount);
}

// Deal of the day ends 24h from now (computed on the server at render time).
const dealEndsAt = new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString();

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* a. Hero carousel */}
      <HeroCarousel />

      {/* b. Quick category tiles */}
      <section className="py-8 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 sm:gap-4">
            {quickCategories.map((c) => (
              <Link
                key={c.slug}
                href={`/product-category/${c.slug}`}
                className="group flex flex-col items-center gap-2"
              >
                <div
                  className={`h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-gradient-to-br ${c.color} flex items-center justify-center text-3xl shadow-sm group-hover:shadow-md group-hover:-translate-y-0.5 transition-all`}
                >
                  <span aria-hidden>{c.emoji}</span>
                </div>
                <span className="text-xs font-medium text-gray-700 text-center group-hover:text-[#1c61e7] transition-colors">
                  {c.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* c. Promo codes */}
      <PromoCodes />

      {/* d. Nouveautés */}
      <NewArrivals />

      {/* e. Deal of the day */}
      <section className="py-14 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#f97316] via-[#ea6c0a] to-[#c2410c] text-white shadow-xl">
            <div className="absolute inset-0 opacity-10 pointer-events-none">
              <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-white blur-3xl translate-x-1/3 -translate-y-1/3" />
            </div>
            <div className="relative grid lg:grid-cols-2 gap-8 p-6 sm:p-10">
              <div>
                <div className="inline-flex items-center gap-2 bg-white/15 border border-white/25 rounded-full px-3 py-1 text-xs font-semibold mb-4">
                  <Flame className="h-3.5 w-3.5" />
                  Offre du jour
                </div>
                <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">
                  Coffret découverte des saveurs du Québec
                </h2>
                <p className="text-white/90 mb-5 max-w-md">
                  Une sélection des meilleurs produits du terroir québécois. Quantités limitées,
                  jusqu’à épuisement des stocks.
                </p>
                <div className="flex items-end gap-3 mb-5">
                  <span className="text-4xl font-bold">{formatCAD(49.99)}</span>
                  <span className="text-white/70 line-through text-lg">{formatCAD(79.99)}</span>
                  <span className="bg-white text-[#c2410c] text-xs font-bold px-2 py-1 rounded">-38 %</span>
                </div>
                <div className="bg-white/10 backdrop-blur rounded-xl p-4 mb-5 inline-block">
                  <p className="text-xs font-medium text-white/80 uppercase tracking-wide mb-2">
                    Offre se termine dans
                  </p>
                  <div className="[&_div.bg-\[\#1c61e7\]]:!bg-white [&_div.bg-\[\#1c61e7\]]:!text-[#c2410c] [&_span]:!text-white/80">
                    <Countdown endsAt={dealEndsAt} />
                  </div>
                </div>
                <div>
                  <Link
                    href="/shop/coffret-decouverte"
                    className="inline-flex items-center gap-2 bg-white text-[#c2410c] font-bold px-6 py-3 rounded-xl hover:bg-orange-50 transition-colors shadow"
                  >
                    Profiter de l’offre
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
              <div className="hidden lg:flex items-center justify-center">
                <div className="relative w-full max-w-sm aspect-square rounded-3xl bg-white/10 backdrop-blur border border-white/20 flex items-center justify-center">
                  <span className="text-[12rem] select-none" aria-hidden>🎁</span>
                  <div className="absolute -top-3 -right-3 bg-white text-[#c2410c] text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                    Édition limitée
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* f. Catégories grid */}
      <section className="py-14 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900">
              Explorez par catégorie
            </h2>
            <p className="text-gray-600 mt-2">
              Tout ce que le Québec a de mieux à offrir, regroupé pour vous.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-3 sm:gap-4 lg:gap-5">
            {featuredCategories.map((cat) => (
              <Link
                key={cat.slug}
                href={`/product-category/${cat.slug}`}
                className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br ${cat.gradient} text-white p-4 sm:p-5 aspect-[4/3] flex flex-col justify-between hover:shadow-xl hover:-translate-y-1 transition-all`}
              >
                <div className="absolute -bottom-4 -right-4 text-7xl sm:text-8xl opacity-20 group-hover:opacity-30 group-hover:scale-110 transition-all select-none">
                  {cat.emoji}
                </div>
                <span className="text-3xl sm:text-4xl select-none" aria-hidden>
                  {cat.emoji}
                </span>
                <div className="relative">
                  <h3 className="text-sm sm:text-lg font-bold leading-tight">{cat.name}</h3>
                  <p className="text-xs sm:text-sm text-white/85 mt-0.5">{cat.count} produits</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* g. Vendeurs vedettes */}
      <section className="py-14 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between flex-wrap gap-3 mb-8">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#1c61e7] uppercase tracking-wide mb-2">
                <Store className="h-3.5 w-3.5" />
                Boutiques en vedette
              </div>
              <h2 className="text-3xl font-bold tracking-tight text-gray-900">
                Nos vendeurs à découvrir
              </h2>
              <p className="text-gray-600 mt-1">
                Des entrepreneurs passionnés de partout au Québec.
              </p>
            </div>
            <Link
              href="/stores"
              className="inline-flex items-center gap-1 text-sm font-semibold text-[#1c61e7] hover:underline"
            >
              Toutes les boutiques
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {vendors.map((v) => (
              <Link
                key={v.slug}
                href={`/stores/${v.slug}`}
                className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all"
              >
                <div className={`h-28 bg-gradient-to-r ${v.gradient}`} />
                <div className="relative px-5 pb-5">
                  <div className="absolute -top-9 left-5 w-18 h-18 rounded-full border-4 border-white bg-white shadow-md flex items-center justify-center">
                    <span className="h-14 w-14 rounded-full bg-[#eff6ff] flex items-center justify-center text-2xl font-bold text-[#1c61e7]">
                      {v.name.charAt(0)}
                    </span>
                  </div>
                  <div className="pt-11">
                    <h3 className="font-bold text-gray-900 group-hover:text-[#1c61e7] transition-colors">
                      {v.name}
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5 inline-flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {v.city}
                    </p>
                    <p className="text-sm text-gray-600 mt-3">{v.products} produits disponibles</p>
                    <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-[#1c61e7]">
                      Visiter la boutique
                      <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* h. Banner CTA — Devenir vendeur */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-gray-900 via-slate-900 to-[#1648b0] text-white">
            <div className="absolute inset-0 opacity-10 pointer-events-none">
              <div className="absolute -top-10 -right-10 w-96 h-96 rounded-full bg-[#f97316] blur-3xl" />
              <div className="absolute -bottom-10 -left-10 w-80 h-80 rounded-full bg-[#1c61e7] blur-3xl" />
            </div>
            <div className="relative p-8 sm:p-12 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-2 bg-[#f97316]/20 border border-[#f97316]/40 text-[#fdba74] rounded-full px-3 py-1 text-xs font-semibold mb-4">
                  <Users className="h-3.5 w-3.5" />
                  Vous êtes entrepreneur ?
                </div>
                <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">
                  Devenez vendeur sur Horizon Local
                </h2>
                <p className="text-white/80 max-w-xl">
                  Vendez vos produits québécois à des milliers de clients partout au Canada.
                  Inscription gratuite, commissions transparentes, support en français.
                </p>
              </div>
              <Link
                href="/register?role=vendor"
                className="inline-flex items-center gap-2 bg-[#f97316] hover:bg-[#ea6c0a] text-white font-bold px-6 py-3 rounded-xl transition-colors shadow-lg flex-shrink-0"
              >
                Ouvrir ma boutique
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* i. Newsletter */}
      <NewsletterForm />

      {/* j. Trust badges */}
      <section className="py-12 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[#eff6ff] flex items-center justify-center">
                <Truck className="h-6 w-6 text-[#1c61e7]" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Livraison au Québec</h3>
                <p className="text-sm text-gray-600">Gratuite dès 75 $ d’achat</p>
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
                <h3 className="font-semibold text-gray-900">100 % québécois</h3>
                <p className="text-sm text-gray-600">Entreprises locales vérifiées</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
