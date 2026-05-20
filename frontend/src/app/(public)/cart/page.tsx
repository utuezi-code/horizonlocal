'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Trash2, Tag, X, ShoppingBag, ChevronRight } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';

const TPS = 0.05;
const TVQ = 0.09975;
const FREE_SHIPPING_THRESHOLD = 75;
const SHIPPING_FEE = 9.99;

function fmt(n: number) {
  return new Intl.NumberFormat('fr-CA', { style: 'currency', currency: 'CAD' }).format(n);
}

type CartItemProduct = {
  id: number;
  name: string;
  slug: string;
  price: number;
  stock: number;
  images?: { url: string }[];
  vendor?: { store_name: string };
};

type CartItemType = {
  id: number;
  quantity: number;
  product?: CartItemProduct;
  variant?: { price?: number };
};

export default function CartPage() {
  const { user } = useAuthStore();
  const { fetchCart, removeFromCart, updateQuantity } = useCart();
  const { cart: cartData } = useCartStore();

  const [couponCode, setCouponCode] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number } | null>(null);

  useEffect(() => {
    if (user) fetchCart();
  }, [user, fetchCart]);

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center">
        <ShoppingBag className="mx-auto h-16 w-16 text-gray-200 mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Votre panier</h1>
        <p className="text-gray-500 mb-6">Connectez-vous pour voir votre panier et passer commande.</p>
        <Link href="/login?redirect=/cart" className="inline-flex items-center gap-2 bg-[#1c61e7] text-white font-semibold px-6 py-3 rounded-xl hover:bg-[#1648b0] transition-colors">
          Se connecter
        </Link>
      </div>
    );
  }

  const items = (cartData?.items ?? []) as CartItemType[];

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center">
        <ShoppingBag className="mx-auto h-16 w-16 text-gray-200 mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Votre panier est vide</h1>
        <p className="text-gray-500 mb-6">Ajoutez des produits pour commencer vos achats.</p>
        <Link href="/shop" className="inline-flex items-center gap-2 bg-[#1c61e7] text-white font-semibold px-6 py-3 rounded-xl hover:bg-[#1648b0] transition-colors">
          Découvrir les produits <ChevronRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  // Group by vendor
  const byVendor: Record<string, CartItemType[]> = {};
  for (const item of items) {
    const vendorName = item.product?.vendor?.store_name ?? 'Boutique';
    if (!byVendor[vendorName]) byVendor[vendorName] = [];
    byVendor[vendorName].push(item);
  }

  const subtotal = items.reduce((sum, item) => {
    const price = item.variant?.price ?? item.product?.price ?? 0;
    return sum + price * item.quantity;
  }, 0);

  const discount = appliedCoupon?.discount ?? 0;
  const afterDiscount = Math.max(0, subtotal - discount);
  const shipping = afterDiscount >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
  const taxable = afterDiscount + shipping;
  const tps = taxable * TPS;
  const tvq = taxable * TVQ;
  const total = taxable + tps + tvq;

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    setCouponError('');
    try {
      const res = await api.post('/cart/coupon', { code: couponCode.trim() });
      setAppliedCoupon({ code: res.data.coupon_code, discount: res.data.discount_amount });
      setCouponCode('');
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Code invalide.';
      setCouponError(msg);
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = async () => {
    await api.delete('/cart/coupon');
    setAppliedCoupon(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">
        Votre panier{' '}
        <span className="text-gray-400 font-normal text-lg">
          ({items.length} article{items.length > 1 ? 's' : ''})
        </span>
      </h1>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Items */}
        <div className="flex-1 space-y-6">
          {Object.entries(byVendor).map(([vendorName, vendorItems]) => (
            <div key={vendorName} className="border border-gray-100 rounded-xl overflow-hidden">
              <div className="bg-gray-50 px-4 py-3 border-b border-gray-100">
                <p className="text-sm font-semibold text-gray-700">{vendorName}</p>
              </div>
              <div className="divide-y divide-gray-50">
                {vendorItems.map((item) => {
                  const product = item.product;
                  const price = item.variant?.price ?? product?.price ?? 0;
                  return (
                    <div key={item.id} className="flex gap-4 p-4">
                      <div className="w-20 h-20 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 flex-shrink-0 overflow-hidden">
                        {product?.images?.[0]?.url ? (
                          <img src={product.images[0].url} alt={product.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-2xl">📦</div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <Link href={`/shop/${product?.slug ?? ''}`} className="text-sm font-medium text-gray-900 hover:text-[#1c61e7] line-clamp-2">
                          {product?.name}
                        </Link>
                        <p className="text-sm font-bold text-[#1c61e7] mt-1">{fmt(price)}</p>
                        {(product?.stock ?? 99) < item.quantity && (
                          <p className="text-xs text-red-500 mt-1">Stock insuffisant ({product?.stock} dispo)</p>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-3 flex-shrink-0">
                        <button onClick={() => removeFromCart(item.id)} className="text-gray-400 hover:text-red-500 transition-colors">
                          <Trash2 className="h-4 w-4" />
                        </button>
                        <div className="flex items-center border border-gray-200 rounded-lg text-sm overflow-hidden">
                          <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="px-2 py-1 hover:bg-gray-50 text-gray-600 font-bold">−</button>
                          <span className="px-3 py-1 font-medium">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="px-2 py-1 hover:bg-gray-50 text-gray-600 font-bold">+</button>
                        </div>
                        <p className="text-sm font-semibold text-gray-900">{fmt(price * item.quantity)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Promo code */}
          <div className="border border-gray-100 rounded-xl p-4">
            <p className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <Tag className="h-4 w-4 text-[#1c61e7]" /> Code promo
            </p>
            {appliedCoupon ? (
              <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                <span className="font-mono text-sm font-bold text-green-700">{appliedCoupon.code}</span>
                <span className="text-sm text-green-600">— rabais de {fmt(appliedCoupon.discount)}</span>
                <button onClick={handleRemoveCoupon} className="ml-auto text-green-500 hover:text-green-700">
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  onKeyDown={(e) => e.key === 'Enter' && handleApplyCoupon()}
                  placeholder="PRINTEMPS20"
                  className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono uppercase focus:outline-none focus:border-[#1c61e7]"
                />
                <button
                  onClick={handleApplyCoupon}
                  disabled={couponLoading || !couponCode}
                  className="bg-[#1c61e7] text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-[#1648b0] disabled:opacity-50 transition-colors"
                >
                  {couponLoading ? '…' : 'Appliquer'}
                </button>
              </div>
            )}
            {couponError && <p className="text-red-500 text-xs mt-2">{couponError}</p>}
          </div>
        </div>

        {/* Order summary */}
        <div className="lg:w-80 flex-shrink-0">
          <div className="border border-gray-100 rounded-xl p-5 sticky top-24 space-y-3">
            <h2 className="font-bold text-gray-900 text-lg">Récapitulatif</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Sous-total</span><span>{fmt(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-green-600 font-medium">
                  <span>Rabais ({appliedCoupon?.code})</span><span>−{fmt(discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-600">
                <span>Livraison</span>
                <span>{shipping === 0
                  ? <span className="text-green-600 font-medium">Gratuite 🎉</span>
                  : fmt(shipping)}
                </span>
              </div>
              {shipping > 0 && (
                <p className="text-xs text-gray-400">Livraison gratuite dès {fmt(FREE_SHIPPING_THRESHOLD)}</p>
              )}
              <div className="flex justify-between text-gray-500">
                <span>TPS (5 %)</span><span>{fmt(tps)}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>TVQ (9,975 %)</span><span>{fmt(tvq)}</span>
              </div>
            </div>
            <div className="border-t border-gray-100 pt-3 flex justify-between font-bold text-gray-900 text-lg">
              <span>Total</span><span>{fmt(total)}</span>
            </div>
            <Link
              href="/checkout"
              className="block w-full text-center bg-[#f97316] hover:bg-[#ea6c0a] text-white font-bold py-3 rounded-xl transition-colors shadow"
            >
              Passer à la caisse →
            </Link>
            <Link href="/shop" className="block text-center text-sm text-gray-400 hover:text-[#1c61e7] mt-1">
              ← Continuer mes achats
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
