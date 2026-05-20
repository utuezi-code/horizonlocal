import Link from 'next/link';
import { MapPin } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="mb-3">
              <span className="text-2xl font-bold text-white">Horizon</span>
              <span className="text-2xl font-bold text-[#f97316]">Local</span>
            </div>
            <p className="text-sm text-gray-400 max-w-xs mb-4">
              L&apos;innovation au service des entreprises Québécoises.
            </p>
            <div className="inline-flex items-center gap-2 bg-[#1c61e7]/20 border border-[#1c61e7]/30 rounded-full px-4 py-2">
              <MapPin className="h-4 w-4 text-[#1c61e7]" />
              <span className="text-sm font-medium text-white">Produits 100% québécois</span>
            </div>
            {/* Social */}
            <div className="flex items-center gap-3 mt-5">
              <a
                href="#"
                className="p-2 rounded-full bg-gray-800 hover:bg-[#1c61e7] text-gray-400 hover:text-white transition-colors"
                aria-label="Facebook"
              >
                <span className="text-xs font-bold">f</span>
              </a>
              <a
                href="#"
                className="p-2 rounded-full bg-gray-800 hover:bg-[#1c61e7] text-gray-400 hover:text-white transition-colors"
                aria-label="Instagram"
              >
                <span className="text-xs font-bold">f</span>
              </a>
              <a
                href="#"
                className="p-2 rounded-full bg-gray-800 hover:bg-[#1c61e7] text-gray-400 hover:text-white transition-colors"
                aria-label="X (Twitter)"
              >
                <span className="text-xs font-bold">X</span>
              </a>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="text-white font-semibold mb-4">Navigation</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/shop" className="hover:text-white transition-colors">
                  Boutique
                </Link>
              </li>
              <li>
                <Link href="/stores" className="hover:text-white transition-colors">
                  Nos boutiques
                </Link>
              </li>
              <li>
                <Link href="/promotions" className="hover:text-white transition-colors">
                  Promotions
                </Link>
              </li>
              <li>
                <Link href="/blog" className="hover:text-white transition-colors">
                  Blog
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-white font-semibold mb-4">Légal</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/politique-de-confidentialite" className="hover:text-white transition-colors">
                  Politique de confidentialité
                </Link>
              </li>
              <li>
                <Link href="/cgv" className="hover:text-white transition-colors">
                  CGV
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500">
            &copy; {new Date().getFullYear()} HorizonLocal. Tous droits réservés.
          </p>
          <p className="text-xs text-gray-600">
            Fièrement hébergé au Québec, Canada
          </p>
        </div>
      </div>
    </footer>
  );
}
