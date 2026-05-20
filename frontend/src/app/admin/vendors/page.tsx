'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Vendor } from '@/types';

export default function AdminVendorsPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);

  useEffect(() => { api.get('/admin/vendors').then(r => setVendors(r.data.data ?? [])).catch(() => {}); }, []);

  async function approve(id: number) {
    await api.put(`/admin/vendors/${id}/approve`);
    setVendors(v => v.map(v => v.id === id ? { ...v, status: 'approved' } : v));
  }

  async function suspend(id: number) {
    await api.put(`/admin/vendors/${id}/suspend`);
    setVendors(v => v.map(v => v.id === id ? { ...v, status: 'suspended' } : v));
  }

  const statusColor = (s: string) => ({ approved: 'bg-green-100 text-green-700', pending: 'bg-yellow-100 text-yellow-700', suspended: 'bg-red-100 text-red-700' }[s] ?? 'bg-gray-100 text-gray-600');

  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-dark mb-8">Gestion des vendeurs</h1>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>{['Boutique', 'Ville', 'Commission', 'Statut', 'Actions'].map(h => <th key={h} className="px-4 py-3 text-left font-semibold text-gray-600">{h}</th>)}</tr>
          </thead>
          <tbody className="divide-y">
            {vendors.map(v => (
              <tr key={v.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-dark">{v.store_name}</td>
                <td className="px-4 py-3 text-gray-500">{v.city}, {v.province}</td>
                <td className="px-4 py-3 text-gray-500">{v.commission_rate}%</td>
                <td className="px-4 py-3"><span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor(v.status)}`}>{v.status}</span></td>
                <td className="px-4 py-3 flex gap-2">
                  {v.status !== 'approved' && <button onClick={() => approve(v.id)} className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded hover:bg-green-100">Approuver</button>}
                  {v.status !== 'suspended' && <button onClick={() => suspend(v.id)} className="text-xs bg-red-50 text-red-700 px-2 py-1 rounded hover:bg-red-100">Suspendre</button>}
                </td>
              </tr>
            ))}
            {vendors.length === 0 && <tr><td colSpan={5} className="px-4 py-10 text-center text-gray-400">Aucun vendeur</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
