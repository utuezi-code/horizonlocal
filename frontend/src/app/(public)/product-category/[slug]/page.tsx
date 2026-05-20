import Link from 'next/link';
import { Sidebar } from '@/components/layout/Sidebar';

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const categoryName = slug
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 mb-6 flex items-center gap-2">
        <Link href="/" className="hover:text-[#1c61e7]">Accueil</Link>
        <span>/</span>
        <Link href="/shop" className="hover:text-[#1c61e7]">Boutique</Link>
        <span>/</span>
        <span className="text-gray-900 font-medium">{categoryName}</span>
      </nav>

      <h1 className="text-2xl font-bold text-gray-900 mb-6">{categoryName}</h1>

      <div className="flex gap-8">
        <div className="hidden lg:block">
          <Sidebar />
        </div>

        <div className="flex-1 min-w-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                  <span className="text-4xl">🏷️</span>
                </div>
                <div className="p-3">
                  <p className="text-xs text-gray-500">Boutique locale</p>
                  <p className="text-sm font-medium text-gray-900 mt-1">{categoryName} #{i + 1}</p>
                  <p className="text-sm font-bold text-[#1c61e7] mt-1">
                    {new Intl.NumberFormat('fr-CA', { style: 'currency', currency: 'CAD' }).format(
                      24.99 + i * 4
                    )}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
