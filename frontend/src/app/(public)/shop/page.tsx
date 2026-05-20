import { Suspense } from 'react';
import Link from 'next/link';
import { ChevronDown } from 'lucide-react';
import { Sidebar } from '@/components/layout/Sidebar';

interface ShopSearchParams {
  q?: string;
  category?: string;
  min_price?: string;
  max_price?: string;
  sort?: string;
  page?: string;
  featured?: string;
  in_stock?: string;
}

const SORT_OPTIONS = [
  { value: 'newest', label: 'Plus récents' },
  { value: 'price_asc', label: 'Prix croissant' },
  { value: 'price_desc', label: 'Prix décroissant' },
  { value: 'popular', label: 'Popularité' },
  { value: 'rating', label: 'Meilleures notes' },
];

function ProductSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden animate-pulse">
      <div className="aspect-square bg-gray-200" />
      <div className="p-3 space-y-2">
        <div className="h-3 bg-gray-200 rounded w-1/3" />
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-5 bg-gray-200 rounded w-1/2" />
      </div>
    </div>
  );
}

async function ProductsList({ searchParams }: { searchParams: ShopSearchParams }) {
  // In production, fetch from API based on searchParams
  // const params = new URLSearchParams({ ...searchParams });
  // const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products?${params}`, { cache: 'no-store' });
  // const data = await res.json();

  // Placeholder grid
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {Array.from({ length: 12 }).map((_, i) => (
        <div
          key={i}
          className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
        >
          <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
            <span className="text-4xl">{['🍁', '🎨', '🧴', '👟', '🍫', '🌿', '🏺', '👜', '🎸', '📚', '🕯️', '🧶'][i]}</span>
          </div>
          <div className="p-3">
            <p className="text-xs text-gray-500">Boutique locale</p>
            <p className="text-sm font-medium text-gray-900 mt-1">Produit québécois #{i + 1}</p>
            <p className="text-sm font-bold text-[#1c61e7] mt-1">
              {new Intl.NumberFormat('fr-CA', { style: 'currency', currency: 'CAD' }).format(19.99 + i * 5)}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<ShopSearchParams>;
}) {
  const params = await searchParams;
  const currentSort = params.sort || 'newest';
  const currentPage = parseInt(params.page || '1', 10);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 mb-6 flex items-center gap-2">
        <Link href="/" className="hover:text-[#1c61e7]">Accueil</Link>
        <span>/</span>
        <span className="text-gray-900 font-medium">Boutique</span>
      </nav>

      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        {params.q ? `Résultats pour "${params.q}"` : 'Tous les produits'}
      </h1>

      <div className="flex gap-8">
        {/* Sidebar */}
        <div className="hidden lg:block">
          <Sidebar
            currentMin={parseInt(params.min_price || '0', 10)}
            currentMax={parseInt(params.max_price || '1000', 10)}
            inStockOnly={params.in_stock === '1'}
          />
        </div>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          {/* Toolbar */}
          <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
            <p className="text-sm text-gray-600">
              <span className="font-medium">124</span> produits trouvés
            </p>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Trier par :</span>
              <div className="relative">
                <select
                  defaultValue={currentSort}
                  className="appearance-none bg-white border border-gray-200 rounded-lg px-3 py-1.5 pr-8 text-sm text-gray-700 focus:border-[#1c61e7] focus:outline-none cursor-pointer"
                >
                  {SORT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Products */}
          <Suspense
            fallback={
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {Array.from({ length: 12 }).map((_, i) => <ProductSkeleton key={i} />)}
              </div>
            }
          >
            <ProductsList searchParams={params} />
          </Suspense>

          {/* Pagination */}
          <div className="mt-8 flex items-center justify-center gap-2">
            {[1, 2, 3, 4, 5].map((page) => (
              <Link
                key={page}
                href={`/shop?${new URLSearchParams({ ...params, page: String(page) }).toString()}`}
                className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                  page === currentPage
                    ? 'bg-[#1c61e7] text-white'
                    : 'bg-white border border-gray-200 text-gray-600 hover:border-[#1c61e7] hover:text-[#1c61e7]'
                }`}
              >
                {page}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
