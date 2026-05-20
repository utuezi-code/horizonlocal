'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShoppingCart, Search, Menu, X, User, Heart, ChevronDown, LogOut, Package, LayoutDashboard } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import { useAuth } from '@/hooks/useAuth';

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const router = useRouter();
  const { user } = useAuthStore();
  const { getItemCount, openCart } = useCartStore();
  const { logout } = useAuth();

  const itemCount = getItemCount();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/shop?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const navLinks = [
    { href: '/stores', label: 'Boutiques' },
    { href: '/promotions', label: 'Promotions' },
    { href: '/blog', label: 'Blog' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <span className="text-2xl font-bold text-[#1c61e7]">Horizon</span>
            <span className="text-2xl font-bold text-[#f97316]">Local</span>
          </Link>

          {/* Search bar (desktop) */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-xl">
            <div className="relative w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher des produits..."
                className="w-full rounded-full border border-gray-200 bg-gray-50 px-4 py-2 pl-10 text-sm focus:border-[#1c61e7] focus:outline-none focus:ring-2 focus:ring-[#1c61e7]/20"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
          </form>

          {/* Navigation (desktop) */}
          <nav className="hidden lg:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-gray-700 hover:text-[#1c61e7] transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Wishlist */}
            <Link
              href="/favoris"
              className="hidden sm:flex p-2 rounded-full text-gray-600 hover:text-[#1c61e7] hover:bg-[#eff6ff] transition-colors"
              aria-label="Mes favoris"
            >
              <Heart className="h-5 w-5" />
            </Link>

            {/* Cart */}
            <button
              onClick={openCart}
              className="relative p-2 rounded-full text-gray-600 hover:text-[#1c61e7] hover:bg-[#eff6ff] transition-colors"
              aria-label="Panier"
            >
              <ShoppingCart className="h-5 w-5" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center rounded-full bg-[#f97316] text-white text-xs font-bold">
                  {itemCount > 99 ? '99+' : itemCount}
                </span>
              )}
            </button>

            {/* Account */}
            <div className="relative">
              <button
                onClick={() => setAccountMenuOpen(!accountMenuOpen)}
                className="flex items-center gap-1 p-2 rounded-full text-gray-600 hover:text-[#1c61e7] hover:bg-[#eff6ff] transition-colors"
                aria-label="Mon compte"
              >
                <User className="h-5 w-5" />
                {user && <ChevronDown className="h-3 w-3" />}
              </button>

              {accountMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-lg py-1 z-50">
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
                      {(user.role === 'vendor') && (
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

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
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
                placeholder="Rechercher des produits..."
                className="w-full rounded-full border border-gray-200 bg-gray-50 px-4 py-2 pl-10 text-sm focus:border-[#1c61e7] focus:outline-none"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
          </form>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-gray-100 bg-white px-4 py-3 space-y-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="block py-2 text-sm font-medium text-gray-700 hover:text-[#1c61e7]"
              onClick={() => setMobileMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
