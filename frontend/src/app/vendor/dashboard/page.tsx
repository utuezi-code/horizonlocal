'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { formatPrice } from '@/lib/utils';

interface DashboardStats { total_orders: number; revenue_month: number; pending_orders: number; products_count: number; }

export default function VendorDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  useEffect(() => { api.get('/vendor/dashboard').then(r => setStats(r.data)).catch(() => {}); }, []);

  const cards = [
    { label: 'Commandes totales', value: stats?.total_orders ?? '—', color: 'bg-blue-50 text-primary' },
    { label: 'Revenus ce mois', value: stats ? formatPrice(stats.revenue_month) : '—', color: 'bg-green-50 text-green-700' },
    { label: 'En attente expédition', value: stats?.pending_orders ?? '—', color: 'bg-orange-50 text-accent' },
    { label: 'Produits actifs', value: stats?.products_count ?? '—', color: 'bg-purple-50 text-purple-700' },
  ];

  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-dark mb-8">Tableau de bord vendeur</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {cards.map(c => (
          <div key={c.label} className={`rounded-lg p-6 ${c.color} shadow-sm`}>
            <p className="text-sm font-medium opacity-80">{c.label}</p>
            <p className="text-3xl font-bold mt-1">{c.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
