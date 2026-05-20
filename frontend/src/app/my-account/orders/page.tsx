'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Package, ChevronRight, ShoppingBag } from 'lucide-react';
import api from '@/lib/api';

const fmt = (n: number) =>
  new Intl.NumberFormat('fr-CA', { style: 'currency', currency: 'CAD' }).format(n);

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString('fr-CA', { year: 'numeric', month: 'long', day: 'numeric' });

const STATUS: Record<string, { label: string; color: string }> = {
  pending:          { label: 'En attente',       color: 'bg-yellow-100 text-yellow-800' },
  confirmed:        { label: 'Confirmée',         color: 'bg-blue-100 text-blue-800' },
  processing:       { label: 'En préparation',    color: 'bg-blue-100 text-blue-700' },
  shipped:          { label: 'Expédiée',          color: 'bg-purple-100 text-purple-800' },
  delivered:        { label: 'Livrée',            color: 'bg-green-100 text-green-800' },
  cancelled:        { label: 'Annulée',           color: 'bg-red-100 text-red-800' },
  return_requested: { label: 'Retour demandé',    color: 'bg-orange-100 text-orange-800' },
  refunded:         { label: 'Remboursée',        color: 'bg-gray-100 text-gray-800' },
};

const FILTER_TABS = [
  { value: '',          label: 'Toutes' },
  { value: 'pending',   label: 'En attente' },
  { value: 'shipped',   label: 'Expédiées' },
  { value: 'delivered', label: 'Livrées' },
  { value: 'cancelled', label: 'Annulées' },
];

type OrderItem = { id: number; product?: { name?: string }; quantity: number };
type Order = { id: number; status: string; total: number; created_at: string; items?: OrderItem[] };

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('');

  const load = (status: string) => {
    setLoading(true);
    api.get('/my-account/orders', { params: status ? { status } : {} })
      .then(res => setOrders(res.data.data ?? []))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(activeFilter); }, [activeFilter]);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Mes commandes</h1>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {FILTER_TABS.map(tab => (
          <button
            key={tab.value}
            onClick={() => setActiveFilter(tab.value)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              activeFilter === tab.value
                ? 'bg-[#1c61e7] text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-20">
          <ShoppingBag className="mx-auto h-12 w-12 text-gray-200 mb-4" />
          <p className="text-gray-500 mb-4">Aucune commande trouvée.</p>
          <Link href="/shop" className="inline-flex items-center gap-2 bg-[#1c61e7] text-white font-semibold px-5 py-2.5 rounded-xl hover:bg-[#1648b0] transition-colors text-sm">
            Faire mes achats <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map(order => {
            const s = STATUS[order.status] ?? { label: order.status, color: 'bg-gray-100 text-gray-700' };
            return (
              <Link
                key={order.id}
                href={`/my-account/orders/${order.id}`}
                className="flex items-center gap-4 bg-white border border-gray-100 rounded-xl p-4 hover:border-[#1c61e7] hover:shadow-sm transition-all group"
              >
                <div className="w-10 h-10 rounded-lg bg-[#eff6ff] flex items-center justify-center flex-shrink-0">
                  <Package className="h-5 w-5 text-[#1c61e7]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-gray-900 text-sm">Commande #{order.id}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${s.color}`}>{s.label}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {fmtDate(order.created_at)} · {order.items?.length ?? 0} article{(order.items?.length ?? 0) > 1 ? 's' : ''}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-bold text-gray-900 text-sm">{fmt(order.total)}</p>
                  <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-[#1c61e7] ml-auto mt-1 transition-colors" />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
