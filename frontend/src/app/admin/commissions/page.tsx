'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { formatPrice } from '@/lib/utils';

export default function AdminCommissionsPage() {
  const [data, setData] = useState<{ data: { id: number; amount: number; platform_fee: number; status: string; vendor?: { store_name?: string } }[]; summary: { total_pending: number; total_transferred: number; total_failed: number } } | null>(null);
  useEffect(() => { api.get('/admin/commissions').then(r => setData(r.data)).catch(() => {}); }, []);

  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-dark mb-8">Commissions</h1>
      {data?.summary && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          {[
            { label: 'En attente', value: formatPrice(data.summary.total_pending), color: 'bg-yellow-50 text-yellow-700' },
            { label: 'Transféré', value: formatPrice(data.summary.total_transferred), color: 'bg-green-50 text-green-700' },
            { label: 'Échoués', value: String(data.summary.total_failed), color: 'bg-red-50 text-red-700' },
          ].map(c => (
            <div key={c.label} className={`rounded-lg p-5 ${c.color}`}>
              <p className="text-sm font-medium opacity-80">{c.label}</p>
              <p className="text-2xl font-bold mt-1">{c.value}</p>
            </div>
          ))}
        </div>
      )}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>{['Vendeur', 'Montant vendeur', 'Commission', 'Statut', 'Actions'].map(h => <th key={h} className="px-4 py-3 text-left font-semibold text-gray-600">{h}</th>)}</tr>
          </thead>
          <tbody className="divide-y">
            {data?.data?.map(c => (
              <tr key={c.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-gray-700">{c.vendor?.store_name ?? '—'}</td>
                <td className="px-4 py-3">{formatPrice(c.amount)}</td>
                <td className="px-4 py-3">{formatPrice(c.platform_fee)}</td>
                <td className="px-4 py-3"><span className={`px-2 py-1 rounded text-xs font-medium ${c.status === 'transferred' ? 'bg-green-100 text-green-700' : c.status === 'failed' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>{c.status}</span></td>
                <td className="px-4 py-3">
                  {c.status === 'failed' && <button onClick={() => api.post(`/admin/commissions/${c.id}/retry`)} className="text-xs bg-blue-50 text-primary px-2 py-1 rounded hover:bg-blue-100">Relancer</button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
