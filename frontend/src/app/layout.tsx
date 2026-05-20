import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { QueryProvider } from '@/components/providers/QueryProvider';
import { AuthProvider } from '@/components/providers/AuthProvider';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { CartDrawer } from '@/components/cart/CartDrawer';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Horizon Local — Marché multi-vendeurs québécois',
    template: '%s | Horizon Local',
  },
  description:
    'Découvrez des produits 100% québécois sur Horizon Local, le marché en ligne multi-vendeurs du Québec.',
  keywords: ['marché québécois', 'produits locaux', 'acheter québécois', 'multi-vendeurs'],
  openGraph: {
    type: 'website',
    locale: 'fr_CA',
    siteName: 'Horizon Local',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr-CA" className={`${inter.variable} h-full`}>
      <body className="min-h-full flex flex-col bg-white text-[#333333] antialiased">
        <QueryProvider>
          <AuthProvider>
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
            <CartDrawer />
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
