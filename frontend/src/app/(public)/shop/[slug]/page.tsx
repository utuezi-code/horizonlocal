'use server';

import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Star, Truck, Shield, RotateCcw, MapPin } from 'lucide-react';
import { ProductGallery } from '@/components/product/ProductGallery';
import { PriceDisplay } from '@/components/ui/PriceDisplay';
import { StockBadge } from '@/components/ui/StockBadge';
import { ProductCard } from '@/components/product/ProductCard';
import { ProductActions } from '@/components/product/ProductActions';
import type { Product } from '@/types';

async function getProduct(slug: string): Promise<Product | null> {
  try {
    const apiBase = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api';
    const res = await fetch(`${apiBase}/products/${slug}`, { cache: 'no-store' });
    if (res.status === 404) return null;
    if (!res.ok) return null;
    const json = await res.json();
    return json.product ?? json;
  } catch {
    return null;
  }
}

async function getRelated(categoryId: number, excludeSlug: string): Promise<Product[]> {
  try {
    const apiBase = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api';
    const res = await fetch(`${apiBase}/products?category=${categoryId}&per_page=8`, { cache: 'no-store' });
    if (!res.ok) return [];
    const json = await res.json();
    return (json.data ?? []).filter((p: Product) => p.slug !== excludeSlug);
  } catch {
    return [];
  }
}

const TABS = ['Description', 'Spécifications', 'Avis', 'Livraison & retours'];

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) notFound();

  const related = await getRelated(product.category_id, slug);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 mb-6 flex items-center gap-2 flex-wrap">
        <Link href="/" className="hover:text-[#1c61e7]">Accueil</Link>
        <span>/</span>
        <Link href="/shop" className="hover:text-[#1c61e7]">Boutique</Link>
        {product.category && (
          <>
            <span>/</span>
            <Link href={`/product-category/${product.category.slug}`} className="hover:text-[#1c61e7]">
              {product.category.name}
            </Link>
          </>
        )}
        <span>/</span>
        <span className="text-gray-900 line-clamp-1">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Gallery */}
        <ProductGallery images={product.images ?? []} productName={product.name} />

        {/* Product info */}
        <div className="space-y-5">
          {product.vendor && (
            <Link
              href={`/stores/${product.vendor.store_slug}`}
              className="inline-flex items-center gap-1 text-sm text-[#1c61e7] font-medium hover:underline"
            >
              {product.vendor.store_name}
              {product.vendor.city && (
                <span className="flex items-center gap-0.5 text-gray-400 text-xs font-normal">
                  <MapPin className="h-3 w-3" />{product.vendor.city}, {product.vendor.province}
                </span>
              )}
            </Link>
          )}

          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 leading-tight">{product.name}</h1>

          {product.average_rating !== undefined && (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-4 w-4 ${star <= Math.round(product.average_rating!) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-200'}`}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-600">
                {product.average_rating.toFixed(1)} ({product.reviews_count ?? 0} avis)
              </span>
            </div>
          )}

          <PriceDisplay price={product.price} comparePrice={product.compare_price} size="lg" />
          <StockBadge stock={product.stock} />

          {product.short_description && (
            <p className="text-gray-600 leading-relaxed">{product.short_description}</p>
          )}

          {/* Interactive actions (quantity + add-to-cart + wishlist) */}
          <ProductActions product={product} />

          {/* Guarantees */}
          <div className="border border-gray-100 rounded-xl p-4 space-y-3 bg-gray-50">
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <Truck className="h-4 w-4 text-[#1c61e7] shrink-0" />
              <span>Livraison partout au Québec — 3 à 7 jours ouvrables</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <Shield className="h-4 w-4 text-[#1c61e7] shrink-0" />
              <span>Paiement 100 % sécurisé via Stripe</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <RotateCcw className="h-4 w-4 text-[#1c61e7] shrink-0" />
              <span>Retours acceptés sous 30 jours</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <ProductTabs product={product} />

      {/* Related products */}
      {related.length > 0 && (
        <section className="mt-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Produits similaires</h2>
            <Link href={`/shop?category=${product.category_id}`} className="text-sm text-[#1c61e7] hover:underline">
              Voir tout →
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {related.slice(0, 4).map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function ProductTabs({ product }: { product: Product }) {
  return (
    <div className="mt-12 border border-gray-100 rounded-xl overflow-hidden">
      <div className="flex border-b border-gray-100 bg-gray-50">
        {TABS.map((tab) => (
          <div key={tab} className="px-5 py-3 text-sm font-medium text-gray-600 border-r border-gray-100 last:border-r-0">
            {tab}
          </div>
        ))}
      </div>
      <div className="p-6">
        {product.description ? (
          <div
            className="prose prose-sm max-w-none text-gray-700"
            dangerouslySetInnerHTML={{ __html: product.description }}
          />
        ) : (
          <p className="text-gray-500 text-sm">Aucune description disponible.</p>
        )}
      </div>
    </div>
  );
}
