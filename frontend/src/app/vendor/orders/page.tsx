'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Order } from '@/types';
import { formatPrice, formatDate } from '@/lib/utils';

export default function VendorOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  useEffect(() => { api.get('/vendor/orders').then(r => setOrders(r.data.data ?? [])).catch(() => {}); }, []);

  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-dark mb-8">Commandes</h1>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>{['#', 'Date', 'Client', 'Total', 'Statut'].map(h => <th key={h} className="px-4 py-3 text-left font-semibold text-gray-600">{h}</th>)}</tr>
          </thead>
          <tbody className="divide-y">
            {orders.map(o => (
              <tr key={o.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">#{o.id}</td>
                <td className="px-4 py-3 text-gray-500">{formatDate(o.created_at)}</td>
                <td className="px-4 py-3 text-gray-600">{o.shipping_name}</td>
                <td className="px-4 py-3 font-semibold">{formatPrice(o.total)}</td>
                <td className="px-4 py-3"><span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs">{o.status}</span></td>
              </tr>
            ))}
            {orders.length === 0 && <tr><td colSpan={5} className="px-4 py-10 text-center text-gray-400">Aucune commande</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
