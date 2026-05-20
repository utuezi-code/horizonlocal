'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { Order } from '@/types';
import { formatPrice, formatDate } from '@/lib/utils';

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending_payment:   { label: 'En attente de paiement', color: 'bg-yellow-100 text-yellow-800' },
  payment_confirmed: { label: 'Paiement confirmé', color: 'bg-blue-100 text-blue-800' },
  processing:        { label: 'En préparation', color: 'bg-blue-100 text-blue-800' },
  shipped:           { label: 'Expédié', color: 'bg-purple-100 text-purple-800' },
  delivered:         { label: 'Livré', color: 'bg-green-100 text-green-800' },
  completed:         { label: 'Complété', color: 'bg-green-100 text-green-800' },
  cancelled:         { label: 'Annulé', color: 'bg-red-100 text-red-800' },
  refunded:          { label: 'Remboursé', color: 'bg-gray-100 text-gray-800' },
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/my-account/orders').then(res => {
      setOrders(res.data.data ?? []);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="container mx-auto px-4 py-10 text-center text-gray-500">Chargement...</div>;

  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-dark mb-8">Mes commandes</h1>
      {orders.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-500 mb-6">Vous n&apos;avez pas encore de commandes.</p>
          <Link href="/shop" className="bg-primary text-white px-6 py-3 rounded-md font-semibold">Faire mes achats</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const statusInfo = STATUS_LABELS[order.status] ?? { label: order.status, color: 'bg-gray-100 text-gray-800' };
            return (
              <div key={order.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex flex-wrap justify-between items-start gap-4">
                  <div>
                    <p className="font-bold text-dark">Commande #{order.id}</p>
                    <p className="text-sm text-gray-500">{formatDate(order.created_at)}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusInfo.color}`}>{statusInfo.label}</span>
                  <div className="text-right">
                    <p className="font-bold text-dark">{formatPrice(order.total)}</p>
                    <p className="text-sm text-gray-500">{order.items?.length ?? 0} article{(order.items?.length ?? 0) > 1 ? 's' : ''}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
