'use client';

import Link from 'next/link';
import { useCart } from '@/hooks/useCart';
import { useCartStore } from '@/store/cartStore';
import { PriceDisplay } from '@/components/ui/PriceDisplay';
import { formatPrice } from '@/lib/utils';

export default function CartPage() {
  const { cart } = useCartStore();
  const { updateQuantity, removeFromCart } = useCart();

  if (!cart || cart.items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-3xl font-bold text-dark mb-4">Votre panier est vide</h1>
        <p className="text-gray-500 mb-8">Ajoutez des produits pour commencer vos achats.</p>
        <Link href="/shop" className="bg-primary text-white px-6 py-3 rounded-md font-semibold hover:bg-primary-600 transition-colors">
          Découvrir nos produits
        </Link>
      </div>
    );
  }

  const subtotal = cart.items.reduce((sum, item) => {
    const price = item.variant?.price ?? item.product.price;
    return sum + price * item.quantity;
  }, 0);

  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-dark mb-8">Mon panier ({cart.items.length} article{cart.items.length > 1 ? 's' : ''})</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {cart.items.map((item) => {
            const price = item.variant?.price ?? item.product.price;
            const image = item.product.images?.[0]?.url;
            return (
              <div key={item.id} className="bg-white rounded-lg shadow p-4 flex gap-4">
                {image && <img src={image} alt={item.product.name} className="w-24 h-24 object-cover rounded" />}
                <div className="flex-1">
                  <h3 className="font-semibold text-dark">{item.product.name}</h3>
                  {item.product.vendor && (
                    <p className="text-sm text-gray-500">{item.product.vendor.store_name}</p>
                  )}
                  <PriceDisplay price={price} />
                  <div className="flex items-center gap-3 mt-2">
                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-7 h-7 border rounded flex items-center justify-center hover:bg-gray-100">−</button>
                    <span className="font-semibold">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-7 h-7 border rounded flex items-center justify-center hover:bg-gray-100">+</button>
                    <button onClick={() => removeFromCart(item.id)} className="text-red-500 text-sm ml-4 hover:underline">Retirer</button>
                  </div>
                </div>
                <div className="text-right font-bold text-dark">
                  {formatPrice(price * item.quantity)}
                </div>
              </div>
            );
          })}
        </div>
        <div className="bg-white rounded-lg shadow p-6 h-fit space-y-4">
          <h2 className="text-xl font-bold text-dark">Résumé</h2>
          <div className="flex justify-between text-gray-600">
            <span>Sous-total</span><span>{formatPrice(subtotal)}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Livraison</span><span className="text-sm text-gray-400">Calculée au paiement</span>
          </div>
          <div className="border-t pt-4 flex justify-between font-bold text-dark text-lg">
            <span>Total estimé</span><span>{formatPrice(subtotal)}</span>
          </div>
          <Link href="/checkout" className="block w-full bg-primary text-white text-center py-3 rounded-md font-semibold hover:bg-primary-600 transition-colors">
            Passer la commande
          </Link>
          <Link href="/shop" className="block w-full text-center text-primary hover:underline text-sm">
            Continuer mes achats
          </Link>
        </div>
      </div>
    </div>
  );
}
