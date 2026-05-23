import { notFound } from 'next/navigation';
import Link from 'next/link';
import { MapPin, Package } from 'lucide-react';
import { ProductCard } from '@/components/product/ProductCard';
import { ShopSortSelect } from '@/components/shop/ShopSortSelect';
import { SlidersHorizontal } from 'lucide-react';
import { Suspense } from 'react';

interface SearchParams {
  sort_by?: string;
  sort_dir?: string;
  page?: string;
}

async function getVendorData(slug: string, searchParams: SearchParams) {
  const apiBase = process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api';
  const qs = new URLSearchParams({
    per_page: '20',
    sort_by: searchParams.sort_by ?? 'created_at',
    sort_dir: searchParams.sort_dir ?? 'desc',
    ...(searchParams.page && { page: searchParams.page }),
  });
  const res = await fetch(`${apiBase}/vendors/${slug}?${qs}`, { cache: 'no-store' });
  if (!res.ok) return null;
  return res.json();
}

export default async function VendorStorePage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<SearchParams>;
}) {
  const { slug } = await params;
  const sp = await searchParams;

  const data = await getVendorData(slug, sp).catch(() => null);
  if (!data) notFound();

  const vendor = data.vendor;
  const products = data.products;
  const currentPage = parseInt(sp.page ?? '1', 10);
  const currentSort = sp.sort_by ? `${sp.sort_by}|${sp.sort_dir ?? 'desc'}` : 'created_at|desc';
  const basePath = `/stores/${slug}`;

  return (
    <div>
      {/* Banner */}
      <div className="h-48 bg-gradient-to-r from-[#1c61e7] to-[#1648b0] relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-end pb-0">
          <div className="relative -bottom-10 flex items-end gap-4">
            <div className="w-20 h-20 rounded-full border-4 border-white bg-[#eff6ff] flex items-center justify-center shadow-lg">
              <span className="text-3xl font-bold text-[#1c61e7]">
                {vendor.store_name.charAt(0).toUpperCase()}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-8">
        {/* Store info */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">{vendor.store_name}</h1>
          <div className="flex items-center gap-4 mt-2 text-sm text-gray-500 flex-wrap">
            {(vendor.city || vendor.province) && (
              <span className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {[vendor.city, vendor.province].filter(Boolean).join(', ')}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Package className="h-4 w-4" />
              {products.total ?? products.data?.length ?? 0} produit{(products.total ?? 0) !== 1 ? 's' : ''}
            </span>
          </div>
          {vendor.description && (
            <p className="mt-3 text-gray-600 max-w-2xl">{vendor.description}</p>
          )}
        </div>

        {/* Products header */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <h2 className="text-xl font-bold text-gray-900">Produits de cette boutique</h2>
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-600">Trier par :</span>
            <Suspense>
              <ShopSortSelect currentSort={currentSort} basePath={basePath} />
            </Suspense>
          </div>
        </div>

        {products.data?.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <Package className="mx-auto h-12 w-12 text-gray-200 mb-4" />
            <p>Cette boutique n&apos;a pas encore de produits.</p>
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
  );
}
