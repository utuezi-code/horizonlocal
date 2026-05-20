'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { formatPrice } from '@/lib/utils';

export default function AdminDashboardPage() {
  const [financial, setFinancial] = useState<Record<string, number> | null>(null);
  const [platform, setPlatform] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    api.get('/admin/metrics/financial').then(r => setFinancial(r.data)).catch(() => {});
    api.get('/admin/metrics/platform').then(r => setPlatform(r.data)).catch(() => {});
  }, []);

  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-dark mb-8">Tableau de bord administrateur</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {[
          { label: 'Revenus ce mois', value: financial ? formatPrice(financial.revenue_this_month) : '—', color: 'bg-green-50 text-green-700' },
          { label: 'Commissions ce mois', value: financial ? formatPrice(financial.commissions_this_month) : '—', color: 'bg-primary/10 text-primary' },
          { label: 'Vendeurs actifs', value: (platform as { vendors?: { active?: number } } | null)?.vendors?.active ?? '—', color: 'bg-blue-50 text-blue-700' },
          { label: 'Produits publiés', value: (platform as { products?: { published?: number } } | null)?.products?.published ?? '—', color: 'bg-purple-50 text-purple-700' },
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
