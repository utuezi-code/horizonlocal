'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { formatPrice } from '@/lib/utils';

export default function VendorEarningsPage() {
  const [earnings, setEarnings] = useState<{ total: number; pending: number; transferred: number } | null>(null);
  const [stripeOnboarded, setStripeOnboarded] = useState(false);

  useEffect(() => {
    api.get('/vendor/earnings').then(r => setEarnings(r.data)).catch(() => {});
    api.get('/auth/me').then(r => setStripeOnboarded(r.data?.vendor?.stripe_onboarded ?? false)).catch(() => {});
  }, []);

  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-dark mb-8">Mes revenus</h1>
      {!stripeOnboarded && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
          <p className="text-yellow-800 font-medium">Connectez votre compte Stripe pour recevoir vos virements.</p>
          <button
            onClick={() => api.post('/vendor/stripe/connect').then(r => window.location.href = r.data.url)}
            className="mt-2 bg-accent text-white px-4 py-2 rounded-md font-semibold hover:bg-accent-600 transition-colors"
          >
            Configurer Stripe Connect
          </button>
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {[
          { label: 'Total gagné', value: earnings ? formatPrice(earnings.total) : '—', color: 'bg-green-50 text-green-700' },
          { label: 'En attente', value: earnings ? formatPrice(earnings.pending) : '—', color: 'bg-yellow-50 text-yellow-700' },
          { label: 'Transféré', value: earnings ? formatPrice(earnings.transferred) : '—', color: 'bg-blue-50 text-primary' },
        ].map(c => (
          <div key={c.label} className={`rounded-lg p-6 ${c.color} shadow-sm`}>
            <p className="text-sm font-medium opacity-80">{c.label}</p>
            <p className="text-3xl font-bold mt-1">{c.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
