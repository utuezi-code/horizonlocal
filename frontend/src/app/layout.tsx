import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { QueryProvider } from '@/components/providers/QueryProvider';
import { AuthProvider } from '@/components/providers/AuthProvider';
import { StoreHydration } from '@/components/providers/StoreHydration';
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

async function getNavCategories(): Promise<{ slug: string; name: string }[]> {
  try {
    const apiBase = process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api';
    const res = await fetch(`${apiBase}/categories`, { next: { revalidate: 3600 } });
    if (!res.ok) return [];
    const json = await res.json();
    const cats = json.categories ?? json;
    return Array.isArray(cats) ? cats.map((c: { slug: string; name: string }) => ({ slug: c.slug, name: c.name })) : [];
  } catch {
    return [];
  }
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const navCategories = await getNavCategories();

  return (
    <html lang="fr-CA" className={`${inter.variable} h-full`}>
      <body className="min-h-full flex flex-col bg-white text-[#333333] antialiased">
        <QueryProvider>
          <StoreHydration />
          <AuthProvider>
            <Header navCategories={navCategories} />
            <main className="flex-1">{children}</main>
            <Footer />
            <CartDrawer />
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
