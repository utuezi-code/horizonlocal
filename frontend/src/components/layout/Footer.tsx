import Link from 'next/link';
import { MapPin, CreditCard, Mail, Phone } from 'lucide-react';
import { NewsletterForm } from '@/components/home/NewsletterForm';

const aboutLinks = [
  { href: '/a-propos', label: 'À propos d’Horizon Local' },
  { href: '/notre-mission', label: 'Notre mission' },
  { href: '/blog', label: 'Blog' },
  { href: '/carrieres', label: 'Carrières' },
];

const helpLinks = [
  { href: '/aide', label: 'Centre d’aide' },
  { href: '/contact', label: 'Nous joindre' },
  { href: '/livraison', label: 'Livraison & retours' },
  { href: '/suivi-commande', label: 'Suivre ma commande' },
];

const vendorLinks = [
  { href: '/register?role=vendor', label: 'Devenir vendeur' },
  { href: '/vendeurs/guide', label: 'Guide du vendeur' },
  { href: '/vendeurs/tarifs', label: 'Tarifs & commissions' },
  { href: '/stores', label: 'Annuaire des boutiques' },
];

const legalLinks = [
  { href: '/cgv', label: 'CGV' },
  { href: '/politique-de-confidentialite', label: 'Confidentialité' },
  { href: '/cookies', label: 'Cookies' },
  { href: '/mentions-legales', label: 'Mentions légales' },
];

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      {/* Newsletter row */}
      <div className="border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid lg:grid-cols-2 gap-6 items-center">
          <div>
            <h3 className="text-white text-xl font-bold tracking-tight mb-1">
              Restons en contact
            </h3>
            <p className="text-sm text-gray-400">
              Recevez nos meilleures offres et nouveautés québécoises directement par courriel.
            </p>
          </div>
          <div className="flex lg:justify-end">
            <NewsletterForm variant="inline" />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="col-span-2 lg:col-span-1">
            <div className="mb-3 leading-none">
              <span className="text-2xl font-bold tracking-tight text-white">Horizon</span>
              <span className="text-2xl font-bold tracking-tight text-[#f97316]">Local</span>
            </div>
            <p className="text-sm text-gray-400 max-w-xs mb-4">
              L’innovation au service des entreprises québécoises.
            </p>
            <div className="inline-flex items-center gap-2 bg-[#1c61e7]/15 border border-[#1c61e7]/30 rounded-full px-3 py-1.5">
              <MapPin className="h-3.5 w-3.5 text-[#1c61e7]" />
              <span className="text-xs font-medium text-white">100 % québécois</span>
            </div>
          </div>

          {/* À propos */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm tracking-tight">À propos</h4>
            <ul className="space-y-2 text-sm">
              {aboutLinks.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-gray-400 hover:text-white transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Aide */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm tracking-tight">Aide</h4>
            <ul className="space-y-2 text-sm">
              {helpLinks.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-gray-400 hover:text-white transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Vendeurs */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm tracking-tight">Vendeurs</h4>
            <ul className="space-y-2 text-sm">
              {vendorLinks.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-gray-400 hover:text-white transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Nous suivre */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm tracking-tight">Nous suivre</h4>
            <div className="flex items-center gap-2 mb-5">
              <a
                href="#"
                className="px-3 py-1.5 rounded-full bg-gray-800 hover:bg-[#1c61e7] text-gray-400 hover:text-white text-xs font-bold transition-colors"
                aria-label="Facebook"
              >
                Facebook
              </a>
              <a
                href="#"
                className="px-3 py-1.5 rounded-full bg-gray-800 hover:bg-[#1c61e7] text-gray-400 hover:text-white text-xs font-bold transition-colors"
                aria-label="Instagram"
              >
                Instagram
              </a>
            </div>
            <ul className="space-y-2 text-sm text-gray-400">
              <li className="inline-flex items-center gap-2">
                <Mail className="h-4 w-4 text-gray-500" />
                <a href="mailto:bonjour@horizonlocal.ca" className="hover:text-white transition-colors">
                  bonjour@horizonlocal.ca
                </a>
              </li>
              <li className="inline-flex items-center gap-2">
                <Phone className="h-4 w-4 text-gray-500" />
                <span>1-800-555-1234</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom row */}
        <div className="mt-10 pt-6 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-500">
            &copy; {new Date().getFullYear()} HorizonLocal. Tous droits réservés. Fièrement hébergé au Québec, Canada.
          </p>
          <div className="flex items-center gap-3">
            <div className="inline-flex items-center gap-2 text-xs text-gray-500">
              <CreditCard className="h-4 w-4" />
              <span>Visa · Mastercard · Stripe</span>
            </div>
          </div>
          <ul className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
            {legalLinks.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="hover:text-white transition-colors">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
