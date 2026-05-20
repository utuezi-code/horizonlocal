import Link from 'next/link';
import { MapPin, Package } from 'lucide-react';

export default async function VendorStorePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // In production: fetch vendor by slug
  const vendor = {
    store_name: slug
      .split('-')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' '),
    store_slug: slug,
    description: 'Boutique proposant des produits artisanaux québécois de qualité.',
    city: 'Québec',
    province: 'QC',
    products_count: 24,
  };

  return (
    <div>
      {/* Banner */}
      <div className="h-48 bg-gradient-to-r from-[#1c61e7] to-[#1648b0] relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-end pb-0">
          <div className="relative -bottom-10 flex items-end gap-4">
            <div className="w-20 h-20 rounded-full border-4 border-white bg-[#eff6ff] flex items-center justify-center shadow-lg">
              <span className="text-3xl font-bold text-[#1c61e7]">
                {vendor.store_name.charAt(0)}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-8">
        {/* Store info */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">{vendor.store_name}</h1>
          <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              {vendor.city}, {vendor.province}
            </span>
            <span className="flex items-center gap-1">
              <Package className="h-4 w-4" />
              {vendor.products_count} produits
            </span>
          </div>
          {vendor.description && (
            <p className="mt-3 text-gray-600 max-w-2xl">{vendor.description}</p>
          )}
        </div>

        {/* Products */}
        <h2 className="text-xl font-bold text-gray-900 mb-6">Produits de cette boutique</h2>
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
                <p className="text-xs text-gray-500">{vendor.store_name}</p>
                <p className="text-sm font-medium text-gray-900 mt-1">Produit #{i + 1}</p>
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
  );
}
