'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Check, MapPin, CreditCard, ShoppingBag, ChevronRight } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';

const PROVINCES = [
  { value: 'QC', label: 'Québec' }, { value: 'ON', label: 'Ontario' },
  { value: 'BC', label: 'Colombie-Britannique' }, { value: 'AB', label: 'Alberta' },
  { value: 'MB', label: 'Manitoba' }, { value: 'SK', label: 'Saskatchewan' },
  { value: 'NS', label: 'Nouvelle-Écosse' }, { value: 'NB', label: 'Nouveau-Brunswick' },
  { value: 'NL', label: 'Terre-Neuve' }, { value: 'PE', label: 'Île-du-Prince-Édouard' },
];

const TPS = 0.05;
const TVQ = 0.09975;
const FREE_SHIPPING_THRESHOLD = 75;
const SHIPPING_FEE = 9.99;

function fmt(n: number) {
  return new Intl.NumberFormat('fr-CA', { style: 'currency', currency: 'CAD' }).format(n);
}

type Address = {
  name: string;
  address: string;
  city: string;
  province: string;
  postal_code: string;
};

type StepId = 1 | 2 | 3;

const STEPS = [
  { id: 1, label: 'Adresse', icon: MapPin },
  { id: 2, label: 'Paiement', icon: CreditCard },
  { id: 3, label: 'Confirmation', icon: ShoppingBag },
] as const;

const stripePromise = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
  : null;

// ── Payment form (inside Elements) ───────────────────────────────────────────
function PaymentForm({
  clientSecret,
  onSuccess,
  onBack,
  paymentIntentId,
  address,
}: {
  clientSecret: string;
  onSuccess: (piId: string) => void;
  onBack: () => void;
  paymentIntentId: string;
  address: Address;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState('');
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setProcessing(true);
    setError('');

    const { error: stripeError } = await stripe.confirmPayment({
      elements,
      confirmParams: { payment_method_data: { billing_details: { name: address.name, address: { city: address.city, state: address.province, postal_code: address.postal_code, country: 'CA' } } } },
      redirect: 'if_required',
    });

    if (stripeError) {
      setError(stripeError.message ?? 'Erreur de paiement.');
      setProcessing(false);
      return;
    }

    onSuccess(paymentIntentId);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement options={{ layout: 'tabs' }} />
      {error && <p className="text-red-500 text-sm bg-red-50 rounded-lg px-3 py-2">{error}</p>}
      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onBack} className="flex-1 border border-gray-200 text-gray-700 font-semibold py-3 rounded-xl hover:bg-gray-50 transition-colors">
          ← Retour
        </button>
        <button
          type="submit"
          disabled={!stripe || processing}
          className="flex-1 bg-[#f97316] hover:bg-[#ea6c0a] disabled:opacity-60 text-white font-bold py-3 rounded-xl transition-colors"
        >
          {processing ? 'Traitement…' : 'Confirmer le paiement'}
        </button>
      </div>
    </form>
  );
}

// ── Main checkout page ────────────────────────────────────────────────────────
export default function CheckoutPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { cart } = useCartStore();
  const [step, setStep] = useState<StepId>(1);

  const [address, setAddress] = useState<Address>({
    name: user?.name ?? '',
    address: '',
    city: '',
    province: 'QC',
    postal_code: '',
  });

  const [clientSecret, setClientSecret] = useState('');
  const [paymentIntentId, setPaymentIntentId] = useState('');
  const [breakdown, setBreakdown] = useState<{ subtotal: number; shipping_cost: number; tax_gst: number; tax_tvq: number; total: number } | null>(null);
  const [demoMode, setDemoMode] = useState(false);
  const [orderLoading, setOrderLoading] = useState(false);

  const items = (cart?.items ?? []) as { id: number; quantity: number; product?: { price: number }; variant?: { price?: number } }[];
  const subtotal = items.reduce((s, i) => s + (i.variant?.price ?? i.product?.price ?? 0) * i.quantity, 0);
  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
  const taxable = subtotal + shipping;
  const tps = taxable * TPS;
  const tvq = taxable * TVQ;
  const total = taxable + tps + tvq;

  useEffect(() => {
    if (!user) router.push('/login?redirect=/checkout');
  }, [user, router]);

  if (!user) return null;

  const handleAddressNext = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('/checkout/payment-intent', { province: address.province });
      setClientSecret(res.data.client_secret);
      setPaymentIntentId(res.data.payment_intent_id);
      setBreakdown(res.data.breakdown);
      setStep(2);
    } catch {
      // Stripe not configured — demo mode
      setDemoMode(true);
      setStep(2);
    }
  };

  const handlePaymentSuccess = (piId: string) => {
    setPaymentIntentId(piId);
    setStep(3);
  };

  const handlePlaceOrder = async () => {
    setOrderLoading(true);
    try {
      const res = await api.post('/checkout/place-order', {
        payment_intent_id: paymentIntentId || 'demo_' + Date.now(),
        shipping_address: address,
        province: address.province,
      });
      router.push(`/checkout/success?order=${res.data.order.id}`);
    } catch {
      setOrderLoading(false);
    }
  };

  const summaryData = breakdown ?? { subtotal, shipping_cost: shipping, tax_gst: tps, tax_tvq: tvq, total };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Stepper */}
      <div className="flex items-center justify-center mb-10">
        {STEPS.map((s, idx) => (
          <div key={s.id} className="flex items-center">
            <div className={`flex items-center gap-2 ${step >= s.id ? 'text-[#1c61e7]' : 'text-gray-300'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 ${
                step > s.id ? 'bg-[#1c61e7] border-[#1c61e7] text-white' :
                step === s.id ? 'border-[#1c61e7] text-[#1c61e7]' :
                'border-gray-200 text-gray-300'
              }`}>
                {step > s.id ? <Check className="h-4 w-4" /> : s.id}
              </div>
              <span className={`text-sm font-medium hidden sm:block ${step === s.id ? 'text-[#1c61e7]' : step > s.id ? 'text-gray-600' : 'text-gray-300'}`}>
                {s.label}
              </span>
            </div>
            {idx < STEPS.length - 1 && (
              <div className={`w-12 sm:w-20 h-0.5 mx-2 ${step > s.id ? 'bg-[#1c61e7]' : 'bg-gray-200'}`} />
            )}
          </div>
        ))}
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left: form */}
        <div className="flex-1">
          {/* Step 1: Address */}
          {step === 1 && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <MapPin className="h-5 w-5 text-[#1c61e7]" /> Adresse de livraison
              </h2>
              <form onSubmit={handleAddressNext} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nom complet</label>
                  <input required value={address.name} onChange={e => setAddress(a => ({ ...a, name: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1c61e7]" placeholder="Marie Tremblay" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Adresse</label>
                  <input required value={address.address} onChange={e => setAddress(a => ({ ...a, address: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1c61e7]" placeholder="123 Rue Principale" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ville</label>
                    <input required value={address.city} onChange={e => setAddress(a => ({ ...a, city: e.target.value }))}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1c61e7]" placeholder="Montréal" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Code postal</label>
                    <input required value={address.postal_code} onChange={e => setAddress(a => ({ ...a, postal_code: e.target.value.toUpperCase() }))}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-mono uppercase focus:outline-none focus:border-[#1c61e7]" placeholder="H2X 1Y6" maxLength={7} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Province</label>
                  <select required value={address.province} onChange={e => setAddress(a => ({ ...a, province: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1c61e7] bg-white">
                    {PROVINCES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                  </select>
                </div>
                <button type="submit" className="w-full bg-[#1c61e7] hover:bg-[#1648b0] text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 mt-2">
                  Continuer vers le paiement <ChevronRight className="h-4 w-4" />
                </button>
              </form>
            </div>
          )}

          {/* Step 2: Payment */}
          {step === 2 && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-[#1c61e7]" /> Paiement
              </h2>
              {demoMode || !stripePromise ? (
                <div className="space-y-4">
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-700">
                    <strong>Mode démo</strong> — Stripe n'est pas configuré (NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY manquant). Le paiement est simulé.
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => setStep(1)} className="flex-1 border border-gray-200 text-gray-700 font-semibold py-3 rounded-xl hover:bg-gray-50 transition-colors">
                      ← Retour
                    </button>
                    <button onClick={() => handlePaymentSuccess('demo_pi')} className="flex-1 bg-[#f97316] text-white font-bold py-3 rounded-xl hover:bg-[#ea6c0a] transition-colors">
                      Simuler le paiement →
                    </button>
                  </div>
                </div>
              ) : clientSecret ? (
                <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'stripe', variables: { colorPrimary: '#1c61e7' } } }}>
                  <PaymentForm
                    clientSecret={clientSecret}
                    paymentIntentId={paymentIntentId}
                    address={address}
                    onSuccess={handlePaymentSuccess}
                    onBack={() => setStep(1)}
                  />
                </Elements>
              ) : (
                <div className="text-center py-8 text-gray-400">Chargement…</div>
              )}
            </div>
          )}

          {/* Step 3: Review */}
          {step === 3 && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <ShoppingBag className="h-5 w-5 text-[#1c61e7]" /> Révision de la commande
              </h2>
              <div className="border border-gray-100 rounded-xl p-4 mb-4 space-y-2">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Livraison à</h3>
                <p className="text-sm text-gray-900 font-medium">{address.name}</p>
                <p className="text-sm text-gray-600">{address.address}</p>
                <p className="text-sm text-gray-600">{address.city}, {address.province} {address.postal_code}</p>
              </div>
              <div className="bg-green-50 border border-green-100 rounded-xl p-4 mb-6 flex items-center gap-2 text-sm text-green-700">
                <Check className="h-4 w-4 text-green-500" />
                Paiement confirmé. Cliquez sur "Passer la commande" pour finaliser.
              </div>
              <div className="flex gap-3">
                <button onClick={() => setStep(2)} className="flex-1 border border-gray-200 text-gray-700 font-semibold py-3 rounded-xl hover:bg-gray-50 transition-colors">
                  ← Retour
                </button>
                <button onClick={handlePlaceOrder} disabled={orderLoading} className="flex-1 bg-[#f97316] hover:bg-[#ea6c0a] disabled:opacity-60 text-white font-bold py-3 rounded-xl transition-colors">
                  {orderLoading ? 'Traitement…' : 'Passer la commande ✓'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right: order summary */}
        <div className="lg:w-72 flex-shrink-0">
          <div className="border border-gray-100 rounded-xl p-5 sticky top-24">
            <h3 className="font-bold text-gray-900 mb-4">Votre commande</h3>
            <div className="space-y-2 text-sm mb-4">
              {items.slice(0, 4).map((item, i) => (
                <div key={i} className="flex justify-between text-gray-600">
                  <span className="truncate mr-2">{(item as { product?: { name?: string } }).product?.name ?? 'Produit'} ×{item.quantity}</span>
                  <span className="shrink-0">{fmt((item.variant?.price ?? (item as { product?: { price: number } }).product?.price ?? 0) * item.quantity)}</span>
                </div>
              ))}
              {items.length > 4 && <p className="text-gray-400 text-xs">+ {items.length - 4} autre{items.length - 4 > 1 ? 's' : ''}</p>}
            </div>
            <div className="border-t border-gray-100 pt-3 space-y-1 text-sm">
              <div className="flex justify-between text-gray-600"><span>Sous-total</span><span>{fmt(summaryData.subtotal)}</span></div>
              <div className="flex justify-between text-gray-600"><span>Livraison</span><span>{summaryData.shipping_cost === 0 ? 'Gratuite' : fmt(summaryData.shipping_cost)}</span></div>
              <div className="flex justify-between text-gray-500"><span>TPS (5 %)</span><span>{fmt(summaryData.tax_gst)}</span></div>
              <div className="flex justify-between text-gray-500"><span>TVQ (9,975 %)</span><span>{fmt(summaryData.tax_tvq)}</span></div>
              <div className="flex justify-between font-bold text-gray-900 text-base pt-1 border-t border-gray-100 mt-1"><span>Total</span><span>{fmt(summaryData.total)}</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
