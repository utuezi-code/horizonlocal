'use client';

import Link from 'next/link';
import { useWishlist } from '@/hooks/useWishlist';
import { ProductCard } from '@/components/product/ProductCard';

export default function FavorisPage() {
  const { wishlist, removeFromWishlist } = useWishlist();

  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-dark mb-8">Mes favoris</h1>
      {wishlist.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-500 mb-6">Vous n&apos;avez pas encore de favoris.</p>
          <Link href="/shop" className="bg-primary text-white px-6 py-3 rounded-md font-semibold hover:bg-primary-600 transition-colors">
            Découvrir nos produits
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {wishlist.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
