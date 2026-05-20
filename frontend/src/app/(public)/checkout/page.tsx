'use client';

import { useState } from 'react';
import { useCartStore } from '@/store/cartStore';
import { formatPrice } from '@/lib/utils';
import api from '@/lib/api';

const PROVINCES = [
  { value: 'QC', label: 'Québec' }, { value: 'ON', label: 'Ontario' },
  { value: 'BC', label: 'Colombie-Britannique' }, { value: 'AB', label: 'Alberta' },
  { value: 'MB', label: 'Manitoba' }, { value: 'SK', label: 'Saskatchewan' },
  { value: 'NS', label: 'Nouvelle-Écosse' }, { value: 'NB', label: 'Nouveau-Brunswick' },
  { value: 'PE', label: 'Île-du-Prince-Édouard' }, { value: 'NL', label: 'Terre-Neuve-et-Labrador' },
  { value: 'NT', label: 'Territoires du Nord-Ouest' }, { value: 'YT', label: 'Yukon' },
  { value: 'NU', label: 'Nunavut' },
];

export default function CheckoutPage() {
  const { cart } = useCartStore();
  const [form, setForm] = useState({
    shipping_name: '', shipping_address: '', shipping_city: '',
    shipping_province: 'QC', shipping_postal_code: '',
  });
  const [taxes, setTaxes] = useState<{ tps: number; tvq: number; total: number } | null>(null);
  const [loading, setLoading] = useState(false);

  const subtotal = cart?.items.reduce((sum, item) => {
    const price = item.variant?.price ?? item.product.price;
    return sum + price * item.quantity;
  }, 0) ?? 0;

  async function calculateTaxes() {
    try {
      const res = await api.post('/checkout/taxes', {
        subtotal,
        province: form.shipping_province,
      });
      setTaxes(res.data);
    } catch {}
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/checkout/payment-intent', { ...form, subtotal });
      // Redirect to Stripe Elements payment
    } catch {
      setLoading(false);
    }
  }

  if (!cart || cart.items.length === 0) {
    return <div className="container mx-auto px-4 py-20 text-center text-gray-500">Votre panier est vide.</div>;
  }

  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-dark mb-8">Paiement</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-bold text-dark mb-4">Adresse de livraison</h2>
          <form className="space-y-4" onSubmit={handleSubmit}>
            {(['shipping_name', 'shipping_address', 'shipping_city', 'shipping_postal_code'] as const).map((field) => (
              <div key={field}>
                <label className="block text-sm font-medium text-dark mb-1 capitalize">
                  {field.replace('shipping_', '').replace('_', ' ')}
                </label>
                <input
                  type="text" required value={form[field]}
                  onChange={(e) => setForm(prev => ({ ...prev, [field]: e.target.value }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            ))}
            <div>
              <label className="block text-sm font-medium text-dark mb-1">Province</label>
              <select
                value={form.shipping_province}
                onChange={(e) => {
                  setForm(prev => ({ ...prev, shipping_province: e.target.value }));
                  setTaxes(null);
                }}
                onBlur={calculateTaxes}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {PROVINCES.map(p => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
            </div>
            <div className="pt-4">
              <h2 className="text-xl font-bold text-dark mb-4">Paiement sécurisé</h2>
              <div className="bg-gray-50 border border-gray-200 rounded-md p-4 text-gray-500 text-sm text-center">
                Zone de paiement Stripe (intégration Stripe Elements à compléter)
              </div>
            </div>
            <button
              type="submit" disabled={loading}
              className="w-full bg-primary text-white py-3 rounded-md font-semibold hover:bg-primary-600 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Traitement...' : 'Confirmer la commande'}
            </button>
          </form>
        </div>
        <div className="bg-white rounded-lg shadow p-6 h-fit space-y-4">
          <h2 className="text-xl font-bold text-dark">Résumé de la commande</h2>
          {cart.items.map((item) => {
            const price = item.variant?.price ?? item.product.price;
            return (
              <div key={item.id} className="flex justify-between text-sm text-gray-600">
                <span>{item.product.name} × {item.quantity}</span>
                <span>{formatPrice(price * item.quantity)}</span>
              </div>
            );
          })}
          <div className="border-t pt-3 space-y-2">
            <div className="flex justify-between text-gray-600">
              <span>Sous-total</span><span>{formatPrice(subtotal)}</span>
            </div>
            {taxes && (
              <>
                <div className="flex justify-between text-gray-600 text-sm">
                  <span>TPS (5%)</span><span>{formatPrice(taxes.tps)}</span>
                </div>
                {taxes.tvq > 0 && (
                  <div className="flex justify-between text-gray-600 text-sm">
                    <span>TVQ (9,975%)</span><span>{formatPrice(taxes.tvq)}</span>
                  </div>
                )}
              </>
            )}
            <div className="flex justify-between font-bold text-dark text-lg border-t pt-2">
              <span>Total</span>
              <span>{formatPrice(taxes ? taxes.total : subtotal)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
