import { Suspense } from 'react';
import Link from 'next/link';
import { ChevronDown, SlidersHorizontal, Package } from 'lucide-react';
import { Sidebar } from '@/components/layout/Sidebar';
import { ProductCard } from '@/components/product/ProductCard';

interface ShopSearchParams {
  q?: string;
  category?: string;
  vendor?: string;
  min_price?: string;
  max_price?: string;
  sort_by?: string;
  sort_dir?: string;
  page?: string;
  featured?: string;
  in_stock?: string;
}

const SORT_OPTIONS = [
  { value: 'created_at|desc', label: 'Plus récents' },
  { value: 'price|asc',       label: 'Prix croissant' },
  { value: 'price|desc',      label: 'Prix décroissant' },
  { value: 'name|asc',        label: 'Nom A-Z' },
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
  const [sortBy, sortDir] = (searchParams.sort_by
    ? `${searchParams.sort_by}|${searchParams.sort_dir ?? 'desc'}`
    : 'created_at|desc'
  ).split('|');

  const qs = new URLSearchParams({
    per_page: '24',
    sort_by: sortBy,
    sort_dir: sortDir,
    ...(searchParams.q         && { q: searchParams.q }),
    ...(searchParams.category  && { category: searchParams.category }),
    ...(searchParams.vendor    && { vendor: searchParams.vendor }),
    ...(searchParams.min_price && { min_price: searchParams.min_price }),
    ...(searchParams.max_price && { max_price: searchParams.max_price }),
    ...(searchParams.featured  && { featured: searchParams.featured }),
    ...(searchParams.page      && { page: searchParams.page }),
  });

  let data: { data: Record<string, unknown>[]; total: number; last_page: number } = {
    data: [], total: 0, last_page: 1,
  };

  try {
    const apiBase = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api';
    const res = await fetch(`${apiBase}/products?${qs}`, { cache: 'no-store' });
    if (res.ok) data = await res.json();
  } catch {
    // API unreachable — show empty state
  }

  if (data.data.length === 0) {
    return (
      <div className="text-center py-20">
        <Package className="mx-auto h-12 w-12 text-gray-300 mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-1">Aucun produit trouvé</h3>
        <p className="text-gray-500 text-sm mb-4">Essayez de modifier vos filtres ou votre recherche.</p>
        <Link href="/shop" className="text-[#1c61e7] text-sm font-medium hover:underline">
          Réinitialiser les filtres
        </Link>
      </div>
    );
  }

  const currentPage = parseInt(searchParams.page ?? '1', 10);

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        {data.data.map((product: any) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {data.last_page > 1 && (
        <div className="mt-8 flex items-center justify-center gap-2 flex-wrap">
          {Array.from({ length: data.last_page }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={`/shop?${new URLSearchParams({ ...searchParams, page: String(p) })}`}
              className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                p === currentPage
                  ? 'bg-[#1c61e7] text-white'
                  : 'bg-white border border-gray-200 text-gray-600 hover:border-[#1c61e7] hover:text-[#1c61e7]'
              }`}
            >
              {p}
            </Link>
          ))}
        </div>
      )}
    </>
  );
}

export default async function ShopPage({ searchParams }: { searchParams: Promise<ShopSearchParams> }) {
  const params = await searchParams;
  const currentSort = params.sort_by ? `${params.sort_by}|${params.sort_dir ?? 'desc'}` : 'created_at|desc';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <nav className="text-sm text-gray-500 mb-6 flex items-center gap-2">
        <Link href="/" className="hover:text-[#1c61e7]">Accueil</Link>
        <span>/</span>
        <span className="text-gray-900 font-medium">
          {params.q ? `Résultats pour "${params.q}"` : 'Tous les produits'}
        </span>
      </nav>

      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-gray-900">
          {params.q ? `Résultats pour "${params.q}"` : 'Tous les produits'}
        </h1>
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-gray-400" />
          <span className="text-sm text-gray-600">Trier par :</span>
          <div className="relative">
            <select
              defaultValue={currentSort}
              className="appearance-none bg-white border border-gray-200 rounded-lg px-3 py-1.5 pr-8 text-sm text-gray-700 focus:border-[#1c61e7] focus:outline-none cursor-pointer"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      <div className="flex gap-8">
        <div className="hidden lg:block">
          <Sidebar
            currentMin={parseInt(params.min_price ?? '0', 10)}
            currentMax={parseInt(params.max_price ?? '1000', 10)}
            inStockOnly={params.in_stock === '1'}
          />
        </div>

        <div className="flex-1 min-w-0">
          <Suspense
            fallback={
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {Array.from({ length: 12 }).map((_, i) => <ProductSkeleton key={i} />)}
              </div>
            }
          >
            <ProductsList searchParams={params} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
