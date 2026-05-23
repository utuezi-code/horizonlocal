'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShoppingCart,
  Search,
  Menu,
  X,
  User,
  Heart,
  ChevronDown,
  LogOut,
  Package,
  LayoutDashboard,
  MapPin,
  Truck,
  Sparkles,
  Globe,
  Menu as MenuIcon,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import { useAuth } from '@/hooks/useAuth';

const FALLBACK_CATEGORIES = [
  { slug: 'alimentation', label: 'Alimentation' },
  { slug: 'mode', label: 'Mode' },
  { slug: 'maison', label: 'Maison & Déco' },
  { slug: 'beaute-sante', label: 'Beauté & Santé' },
  { slug: 'electronique', label: 'Électronique' },
  { slug: 'sport-loisirs', label: 'Sport & Loisirs' },
  { slug: 'bebe-enfants', label: 'Bébé & Enfants' },
];


function formatCAD(amount: number) {
  return new Intl.NumberFormat('fr-CA', { style: 'currency', currency: 'CAD' }).format(amount);
}

export function Header({ navCategories }: { navCategories?: { slug: string; name: string }[] }) {
  const categories = navCategories?.length
    ? navCategories.map((c) => ({ slug: c.slug, label: c.name }))
    : FALLBACK_CATEGORIES;

  const searchCategories = [
    { value: '', label: 'Toutes catégories' },
    ...categories.map((c) => ({ value: c.slug, label: c.label })),
  ];
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchCategory, setSearchCategory] = useState('');
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [megaMenuOpen, setMegaMenuOpen] = useState(false);
  const accountMenuRef = useRef<HTMLDivElement | null>(null);
  const megaMenuRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();
  const { user } = useAuthStore();
  const { cart, getItemCount, openCart } = useCartStore();
  const { logout } = useAuth();

  const itemCount = getItemCount();
  const subtotal = cart?.total ?? 0;

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (accountMenuRef.current && !accountMenuRef.current.contains(e.target as Node)) {
        setAccountMenuOpen(false);
      }
      if (megaMenuRef.current && !megaMenuRef.current.contains(e.target as Node)) {
        setMegaMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set('q', searchQuery.trim());
    if (searchCategory) params.set('category', searchCategory);
    router.push(`/shop${params.toString() ? `?${params.toString()}` : ''}`);
  };

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      {/* Utility bar */}
      <div className="bg-gray-50 border-b border-gray-100 text-gray-600 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 overflow-hidden">
            <span className="hidden sm:inline-flex items-center gap-1.5">
              <Truck className="h-3.5 w-3.5 text-[#1c61e7]" />
              Livraison gratuite dès 75 $
            </span>
            <span className="hidden md:inline-flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-[#f97316]" />
              Boutiques 100 % québécoises
            </span>
            <span className="sm:hidden inline-flex items-center gap-1.5">
              <Truck className="h-3.5 w-3.5 text-[#1c61e7]" />
              Livraison gratuite 75 $+
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/aide" className="hover:text-[#1c61e7] hidden sm:inline">
              Aide
            </Link>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border border-gray-200 bg-white">
              <Globe className="h-3 w-3" />
              FR-CA · CAD
            </span>
          </div>
        </div>
      </div>

      {/* Main header */}
      <div className="border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-3 lg:gap-6">
            {/* Logo */}
            <Link href="/" className="flex-shrink-0 leading-none">
              <span className="text-2xl font-bold tracking-tight text-[#1c61e7]">Horizon</span>
              <span className="text-2xl font-bold tracking-tight text-[#f97316]">Local</span>
            </Link>

            {/* Search bar with category select (desktop) */}
            <form
              onSubmit={handleSearch}
              className="hidden md:flex flex-1 max-w-3xl"
            >
              <div className="flex w-full rounded-full overflow-hidden border border-gray-200 focus-within:border-[#1c61e7] focus-within:ring-2 focus-within:ring-[#1c61e7]/20 transition">
                <select
                  value={searchCategory}
                  onChange={(e) => setSearchCategory(e.target.value)}
                  aria-label="Catégorie de recherche"
                  className="bg-gray-50 border-r border-gray-200 px-3 text-xs font-medium text-gray-700 focus:outline-none cursor-pointer max-w-[10rem]"
                >
                  {searchCategories.map((c) => (
                    <option key={c.value || 'all'} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Rechercher un produit, une boutique…"
                  className="flex-1 bg-white px-4 py-2 text-sm focus:outline-none"
                />
                <button
                  type="submit"
                  aria-label="Rechercher"
                  className="bg-[#f97316] hover:bg-[#ea6c0a] text-white px-5 transition-colors flex items-center justify-center"
                >
                  <Search className="h-4 w-4" />
                </button>
              </div>
            </form>

            {/* Right actions */}
            <div className="flex items-center gap-1 sm:gap-2">
              {/* Location */}
              <Link
                href="/livraison"
                className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
                aria-label="Adresse de livraison"
              >
                <MapPin className="h-4 w-4 text-[#1c61e7]" />
                <div className="leading-tight">
                  <div className="text-[10px] text-gray-500">Livrer à</div>
                  <div className="text-xs font-semibold text-gray-900">Québec, QC</div>
                </div>
              </Link>

              {/* Wishlist */}
              <Link
                href="/favoris"
                className="hidden sm:flex p-2 rounded-full text-gray-600 hover:text-[#1c61e7] hover:bg-[#eff6ff] transition-colors"
                aria-label="Mes favoris"
              >
                <Heart className="h-5 w-5" />
              </Link>

              {/* Account */}
              <div className="relative" ref={accountMenuRef}>
                <button
                  onClick={() => setAccountMenuOpen((v) => !v)}
                  className="flex items-center gap-1 p-2 rounded-full text-gray-600 hover:text-[#1c61e7] hover:bg-[#eff6ff] transition-colors"
                  aria-label="Mon compte"
                  aria-expanded={accountMenuOpen}
                >
                  <User className="h-5 w-5" />
                  {user && <ChevronDown className="h-3 w-3" />}
                </button>

                {accountMenuOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-white border border-gray-100 rounded-xl shadow-lg py-1 z-50">
                    {user ? (
                      <>
                        <div className="px-4 py-2 border-b border-gray-100">
                          <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
                          <p className="text-xs text-gray-500 truncate">{user.email}</p>
                        </div>
                        <Link
                          href="/my-account"
                          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          onClick={() => setAccountMenuOpen(false)}
                        >
                          <User className="h-4 w-4" />
                          Mon compte
                        </Link>
                        <Link
                          href="/my-account/orders"
                          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          onClick={() => setAccountMenuOpen(false)}
                        >
                          <Package className="h-4 w-4" />
                          Mes commandes
                        </Link>
                        {user.role === 'vendor' && (
                          <Link
                            href="/vendor/dashboard"
                            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                            onClick={() => setAccountMenuOpen(false)}
                          >
                            <LayoutDashboard className="h-4 w-4" />
                            Espace vendeur
                          </Link>
                        )}
                        {(user.role === 'admin' || user.role === 'super_admin') && (
                          <Link
                            href="/admin/dashboard"
                            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                            onClick={() => setAccountMenuOpen(false)}
                          >
                            <LayoutDashboard className="h-4 w-4" />
                            Administration
                          </Link>
                        )}
                        <button
                          onClick={() => { setAccountMenuOpen(false); logout(); }}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
                        >
                          <LogOut className="h-4 w-4" />
                          Se déconnecter
                        </button>
                      </>
                    ) : (
                      <>
                        <Link
                          href="/login"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          onClick={() => setAccountMenuOpen(false)}
                        >
                          Se connecter
                        </Link>
                        <Link
                          href="/register"
                          className="block px-4 py-2 text-sm text-[#1c61e7] font-medium hover:bg-[#eff6ff]"
                          onClick={() => setAccountMenuOpen(false)}
                        >
                          S&apos;inscrire
                        </Link>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Cart */}
              <button
                onClick={openCart}
                className="relative flex items-center gap-2 px-2 sm:px-3 py-2 rounded-lg text-gray-700 hover:text-[#1c61e7] hover:bg-[#eff6ff] transition-colors"
                aria-label="Panier"
              >
                <div className="relative">
                  <ShoppingCart className="h-5 w-5" />
                  {itemCount > 0 && (
                    <span className="absolute -top-2 -right-2 h-4 min-w-4 px-1 flex items-center justify-center rounded-full bg-[#f97316] text-white text-[10px] font-bold leading-none">
                      {itemCount > 99 ? '99+' : itemCount}
                    </span>
                  )}
                </div>
                <div className="hidden sm:block leading-tight text-left">
                  <div className="text-[10px] text-gray-500">Panier</div>
                  <div className="text-xs font-semibold text-gray-900">
                    {formatCAD(subtotal)}
                  </div>
                </div>
              </button>

              {/* Mobile hamburger */}
              <button
                onClick={() => setMobileMenuOpen((v) => !v)}
                className="lg:hidden p-2 rounded-full text-gray-600 hover:bg-gray-100"
                aria-label="Menu"
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {/* Mobile search */}
          <div className="md:hidden pb-3">
            <form onSubmit={handleSearch}>
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Rechercher des produits…"
                  className="w-full rounded-full border border-gray-200 bg-gray-50 px-4 py-2 pl-10 pr-12 text-sm focus:border-[#1c61e7] focus:outline-none"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <button
                  type="submit"
                  aria-label="Rechercher"
                  className="absolute right-1 top-1/2 -translate-y-1/2 bg-[#f97316] hover:bg-[#ea6c0a] text-white p-1.5 rounded-full transition-colors"
                >
                  <Search className="h-3.5 w-3.5" />
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Category navigation strip */}
      <div className="bg-white border-b border-gray-100 hidden lg:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-1 h-11 overflow-x-auto scrollbar-hide">
            {/* Mega menu trigger */}
            <div className="relative" ref={megaMenuRef}>
              <button
                onClick={() => setMegaMenuOpen((v) => !v)}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-semibold text-gray-800 hover:bg-gray-100 transition-colors"
                aria-expanded={megaMenuOpen}
              >
                <MenuIcon className="h-4 w-4" />
                Toutes les catégories
                <ChevronDown className="h-3 w-3" />
              </button>

              {megaMenuOpen && (
                <div className="absolute left-0 mt-1 w-[640px] bg-white border border-gray-100 rounded-2xl shadow-xl p-5 z-50">
                  <div className="grid grid-cols-3 gap-2">
                    {categories.map((c) => (
                      <Link
                        key={c.slug}
                        href={`/product-category/${c.slug}`}
                        onClick={() => setMegaMenuOpen(false)}
                        className="px-3 py-2 text-sm rounded-lg text-gray-700 hover:bg-gray-50 hover:text-[#1c61e7] transition-colors"
                      >
                        {c.label}
                      </Link>
                    ))}
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between text-sm">
                    <Link
                      href="/shop"
                      onClick={() => setMegaMenuOpen(false)}
                      className="font-semibold text-[#1c61e7] hover:underline"
                    >
                      Voir tous les produits
                    </Link>
                    <Link
                      href="/stores"
                      onClick={() => setMegaMenuOpen(false)}
                      className="text-gray-600 hover:text-[#1c61e7]"
                    >
                      Découvrir les boutiques →
                    </Link>
                  </div>
                </div>
              )}
            </div>

            <span className="text-gray-200 mx-1">|</span>

            {categories.slice(0, 7).map((c) => (
              <Link
                key={c.slug}
                href={`/product-category/${c.slug}`}
                className="px-3 py-1.5 rounded-md text-sm text-gray-700 hover:bg-gray-100 hover:text-[#1c61e7] transition-colors whitespace-nowrap"
              >
                {c.label}
              </Link>
            ))}

            <span className="text-gray-200 mx-1">|</span>

            <Link
              href="/promotions"
              className="px-3 py-1.5 rounded-md text-sm font-semibold text-[#f97316] hover:bg-orange-50 transition-colors whitespace-nowrap"
            >
              Promotions
            </Link>
            <Link
              href="/stores"
              className="px-3 py-1.5 rounded-md text-sm text-gray-700 hover:bg-gray-100 hover:text-[#1c61e7] transition-colors whitespace-nowrap"
            >
              Boutiques
            </Link>
            <Link
              href="/blog"
              className="px-3 py-1.5 rounded-md text-sm text-gray-700 hover:bg-gray-100 hover:text-[#1c61e7] transition-colors whitespace-nowrap"
            >
              Blog
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-gray-100 bg-white max-h-[70vh] overflow-y-auto">
          <div className="px-4 py-3 space-y-1">
            <Link
              href="/livraison"
              className="flex items-center gap-2 py-2 text-sm text-gray-700 hover:text-[#1c61e7]"
              onClick={() => setMobileMenuOpen(false)}
            >
              <MapPin className="h-4 w-4 text-[#1c61e7]" />
              Livrer à Québec, QC
            </Link>
            <div className="border-t border-gray-100 my-2" />
            <p className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
              Catégories
            </p>
            {categories.map((c) => (
              <Link
                key={c.slug}
                href={`/product-category/${c.slug}`}
                className="block py-2 text-sm font-medium text-gray-700 hover:text-[#1c61e7]"
                onClick={() => setMobileMenuOpen(false)}
              >
                {c.label}
              </Link>
            ))}
            <div className="border-t border-gray-100 my-2" />
            <Link
              href="/promotions"
              className="block py-2 text-sm font-semibold text-[#f97316]"
              onClick={() => setMobileMenuOpen(false)}
            >
              Promotions
            </Link>
            <Link
              href="/stores"
              className="block py-2 text-sm font-medium text-gray-700 hover:text-[#1c61e7]"
              onClick={() => setMobileMenuOpen(false)}
            >
              Boutiques
            </Link>
            <Link
              href="/blog"
              className="block py-2 text-sm font-medium text-gray-700 hover:text-[#1c61e7]"
              onClick={() => setMobileMenuOpen(false)}
            >
              Blog
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
