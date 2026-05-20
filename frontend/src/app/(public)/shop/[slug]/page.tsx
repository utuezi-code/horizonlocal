'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Heart, Share2, Star, Truck, Shield, RotateCcw } from 'lucide-react';
import { ProductGallery } from '@/components/product/ProductGallery';
import { PriceDisplay } from '@/components/ui/PriceDisplay';
import { StockBadge } from '@/components/ui/StockBadge';
import { Button } from '@/components/ui/Button';
import { useCart } from '@/hooks/useCart';
import { useWishlist } from '@/hooks/useWishlist';
import { Product } from '@/types';

// Mock product for demonstration
const mockProduct: Product = {
  id: 1,
  vendor_id: 1,
  category_id: 1,
  name: 'Produit artisanal québécois',
  slug: 'produit-artisanal-quebecois',
  description: `<p>Ce magnifique produit artisanal est fabriqué à la main par des artisans québécois passionnés. Chaque pièce est unique et porte l'empreinte du savoir-faire local.</p><p>Matériaux de haute qualité, durabilité exceptionnelle et design typiquement québécois.</p>`,
  short_description: 'Un produit artisanal unique, fabriqué à la main au Québec.',
  sku: 'ART-001',
  price: 49.99,
  compare_price: 69.99,
  stock: 12,
  status: 'published',
  is_featured: true,
  images: [],
  vendor: {
    id: 1,
    user_id: 1,
    store_name: 'Artisans Québécois',
    store_slug: 'artisans-quebecois',
    commission_rate: 10,
    stripe_onboarded: true,
    status: 'approved',
    city: 'Québec',
    province: 'QC',
  },
  average_rating: 4.5,
  reviews_count: 24,
};

const TABS = ['Description', 'Spécifications', 'Avis'];

export default function ProductDetailPage({ params }: { params: { slug: string } }) {
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('Description');
  const { addToCart } = useCart();
  const { addToWishlist, isInWishlist } = useWishlist();

  const product = mockProduct; // In production: fetch by params.slug

  const handleAddToCart = async () => {
    await addToCart(product.id, undefined, quantity);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 mb-6 flex items-center gap-2 flex-wrap">
        <Link href="/" className="hover:text-[#1c61e7]">Accueil</Link>
        <span>/</span>
        <Link href="/shop" className="hover:text-[#1c61e7]">Boutique</Link>
        <span>/</span>
        <span className="text-gray-900">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Gallery */}
        <div>
          <ProductGallery images={product.images} productName={product.name} />
        </div>

        {/* Product Info */}
        <div className="space-y-5">
          {/* Vendor */}
          {product.vendor && (
            <Link
              href={`/stores/${product.vendor.store_slug}`}
              className="inline-flex items-center gap-1 text-sm text-[#1c61e7] font-medium hover:underline"
            >
              {product.vendor.store_name}
            </Link>
          )}

          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">{product.name}</h1>

          {/* Rating */}
          {product.average_rating !== undefined && (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-4 w-4 ${
                      star <= Math.round(product.average_rating!)
                        ? 'text-yellow-400 fill-yellow-400'
                        : 'text-gray-200 fill-gray-200'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-600">
                {product.average_rating.toFixed(1)} ({product.reviews_count} avis)
              </span>
            </div>
          )}

          <PriceDisplay
            price={product.price}
            comparePrice={product.compare_price}
            size="lg"
          />

          <StockBadge stock={product.stock} />

          {product.short_description && (
            <p className="text-gray-600 leading-relaxed">{product.short_description}</p>
          )}

          {/* Quantity */}
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-gray-700">Quantité :</span>
            <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="px-3 py-2 hover:bg-gray-50 text-gray-600 font-medium transition-colors"
              >
                −
              </button>
              <span className="px-4 py-2 text-center font-medium min-w-[3rem]">{quantity}</span>
              <button
                onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                className="px-3 py-2 hover:bg-gray-50 text-gray-600 font-medium transition-colors"
              >
                +
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              size="lg"
              className="flex-1"
            >
              Ajouter au panier
            </Button>
            <button
              onClick={() => addToWishlist(product.id)}
              className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl border transition-colors ${
                isInWishlist(product.id)
                  ? 'border-red-300 bg-red-50 text-red-500'
                  : 'border-gray-200 hover:border-[#1c61e7] text-gray-600 hover:text-[#1c61e7]'
              }`}
            >
              <Heart className={`h-5 w-5 ${isInWishlist(product.id) ? 'fill-red-500' : ''}`} />
              <span className="text-sm font-medium">Favoris</span>
            </button>
            <button className="flex items-center justify-center px-4 py-3 rounded-xl border border-gray-200 hover:border-[#1c61e7] text-gray-600 hover:text-[#1c61e7] transition-colors">
              <Share2 className="h-5 w-5" />
            </button>
          </div>

          {/* Guarantees */}
          <div className="border border-gray-100 rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <Truck className="h-4 w-4 text-[#1c61e7] flex-shrink-0" />
              <span>Livraison partout au Québec — sous 3 à 7 jours ouvrables</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <Shield className="h-4 w-4 text-[#1c61e7] flex-shrink-0" />
              <span>Paiement 100% sécurisé via Stripe</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <RotateCcw className="h-4 w-4 text-[#1c61e7] flex-shrink-0" />
              <span>Retours acceptés sous 30 jours</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-12">
        <div className="border-b border-gray-200">
          <div className="flex gap-8">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-3 text-sm font-medium border-b-2 transition-colors -mb-px ${
                  activeTab === tab
                    ? 'border-[#1c61e7] text-[#1c61e7]'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="py-6">
          {activeTab === 'Description' && (
            <div
              className="prose prose-sm max-w-none text-gray-700"
              dangerouslySetInnerHTML={{ __html: product.description || '' }}
            />
          )}
          {activeTab === 'Spécifications' && (
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2 max-w-md">
                <span className="text-sm text-gray-500">SKU</span>
                <span className="text-sm text-gray-900">{product.sku || '—'}</span>
                <span className="text-sm text-gray-500">Catégorie</span>
                <span className="text-sm text-gray-900">{product.category?.name || '—'}</span>
                <span className="text-sm text-gray-500">Vendeur</span>
                <span className="text-sm text-gray-900">{product.vendor?.store_name || '—'}</span>
              </div>
            </div>
          )}
          {activeTab === 'Avis' && (
            <div>
              <p className="text-gray-500 text-sm">
                {product.reviews_count ? `${product.reviews_count} avis` : 'Aucun avis pour ce produit.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
