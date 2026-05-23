import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import Link from 'next/link';
import { Package, SlidersHorizontal } from 'lucide-react';
import { Sidebar } from '@/components/layout/Sidebar';
import { ProductCard } from '@/components/product/ProductCard';
import { ShopSortSelect } from '@/components/shop/ShopSortSelect';

interface SearchParams {
  sort_by?: string;
  sort_dir?: string;
  min_price?: string;
  max_price?: string;
  in_stock?: string;
  page?: string;
}

async function getCategoryData(slug: string, searchParams: SearchParams) {
  const apiBase = process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api';
  const qs = new URLSearchParams({
    per_page: '24',
    sort_by: searchParams.sort_by ?? 'created_at',
    sort_dir: searchParams.sort_dir ?? 'desc',
    ...(searchParams.min_price && { min_price: searchParams.min_price }),
    ...(searchParams.max_price && { max_price: searchParams.max_price }),
    ...(searchParams.in_stock  && { in_stock: searchParams.in_stock }),
    ...(searchParams.page      && { page: searchParams.page }),
  });
  const res = await fetch(`${apiBase}/categories/${slug}?${qs}`, { cache: 'no-store' });
  if (!res.ok) return null;
  return res.json();
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<SearchParams>;
}) {
  const { slug } = await params;
  const sp = await searchParams;

  const data = await getCategoryData(slug, sp).catch(() => null);
  if (!data) notFound();

  const category = data.category;
  const products = data.products;
  const currentPage = parseInt(sp.page ?? '1', 10);
  const currentSort = sp.sort_by ? `${sp.sort_by}|${sp.sort_dir ?? 'desc'}` : 'created_at|desc';
  const basePath = `/product-category/${slug}`;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <nav className="text-sm text-gray-500 mb-6 flex items-center gap-2">
        <Link href="/" className="hover:text-[#1c61e7]">Accueil</Link>
        <span>/</span>
        <Link href="/shop" className="hover:text-[#1c61e7]">Boutique</Link>
        <span>/</span>
        <span className="text-gray-900 font-medium">{category.name}</span>
      </nav>

      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-gray-900">{category.name}</h1>
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-gray-400" />
          <span className="text-sm text-gray-600">Trier par :</span>
          <Suspense>
            <ShopSortSelect currentSort={currentSort} basePath={basePath} />
          </Suspense>
        </div>
      </div>

      <div className="flex gap-8">
        <div className="hidden lg:block">
          <Suspense>
            <Sidebar
              currentMin={parseInt(sp.min_price ?? '0', 10)}
              currentMax={parseInt(sp.max_price ?? '1000', 10)}
              inStockOnly={sp.in_stock === '1'}
              basePath={basePath}
            />
          </Suspense>
        </div>

        <div className="flex-1 min-w-0">
          {products.data?.length === 0 ? (
            <div className="text-center py-20">
              <Package className="mx-auto h-12 w-12 text-gray-300 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Aucun produit trouvé</h3>
              <p className="text-gray-500 text-sm mb-4">Essayez de modifier vos filtres.</p>
              <Link href={basePath} className="text-[#1c61e7] text-sm font-medium hover:underline">
                Réinitialiser les filtres
              </Link>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {products.data.map((product: any) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {products.last_page > 1 && (
                <div className="mt-8 flex items-center justify-center gap-2 flex-wrap">
                  {Array.from({ length: products.last_page }, (_: unknown, i: number) => i + 1).map((p: number) => (
                    <Link
                      key={p}
                      href={`${basePath}?${new URLSearchParams({ ...sp, page: String(p) })}`}
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
          )}
        </div>
      </div>
    </div>
  );
}
