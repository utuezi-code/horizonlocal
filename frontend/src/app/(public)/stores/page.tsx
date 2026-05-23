import Link from 'next/link';
import { Store } from 'lucide-react';

interface Vendor {
  id: number;
  store_name: string;
  store_slug: string;
  city?: string;
  province?: string;
  description?: string;
  products_count?: number;
}

async function getVendors(): Promise<{ vendors: Vendor[]; total: number }> {
  try {
    const apiBase = process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api';
    const res = await fetch(`${apiBase}/vendors?per_page=50`, { cache: 'no-store' });
    if (!res.ok) return { vendors: [], total: 0 };
    const json = await res.json();
    const vendors = Array.isArray(json) ? json : (json.data ?? []);
    return { vendors, total: json.total ?? vendors.length };
  } catch {
    return { vendors: [], total: 0 };
  }
}

export default async function StoresPage() {
  const { vendors, total } = await getVendors();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-gray-900">Nos boutiques partenaires</h1>
        <p className="text-gray-600 mt-2">
          Découvrez {total > 0 ? `${total} boutique${total > 1 ? 's' : ''}` : 'les boutiques'} d&apos;entrepreneurs québécois
        </p>
      </div>

      {vendors.length === 0 ? (
        <div className="text-center py-16">
          <Store className="mx-auto h-12 w-12 text-gray-200 mb-4" />
          <p className="text-gray-500 mb-4">Aucune boutique disponible pour le moment.</p>
          <Link href="/shop" className="inline-flex items-center gap-2 bg-[#1c61e7] text-white font-semibold px-5 py-2.5 rounded-xl hover:bg-[#1648b0] transition-colors">
            Voir tous les produits
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {vendors.map((vendor) => (
            <Link
              key={vendor.id}
              href={`/stores/${vendor.store_slug}`}
              className="group bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300"
            >
              <div className="h-24 bg-gradient-to-r from-[#1c61e7] to-[#1648b0]" />
              <div className="relative px-4 pb-4">
                <div className="absolute -top-8 left-4 w-16 h-16 rounded-full border-4 border-white bg-[#eff6ff] flex items-center justify-center shadow-md">
                  <span className="text-2xl font-bold text-[#1c61e7]">
                    {vendor.store_name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="pt-10">
                  <h3 className="font-bold text-gray-900 group-hover:text-[#1c61e7] transition-colors">
                    {vendor.store_name}
                  </h3>
                  {(vendor.city || vendor.province) && (
                    <p className="text-xs text-gray-500 mt-0.5">
                      {[vendor.city, vendor.province].filter(Boolean).join(', ')}
                    </p>
                  )}
                  {vendor.description && (
                    <p className="text-xs text-gray-600 mt-2 line-clamp-2">{vendor.description}</p>
                  )}
                  {vendor.products_count !== undefined && (
                    <p className="text-xs text-gray-400 mt-2">{vendor.products_count} produit{vendor.products_count !== 1 ? 's' : ''}</p>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
