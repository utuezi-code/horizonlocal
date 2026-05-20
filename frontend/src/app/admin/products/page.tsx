'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Product } from '@/types';
import { formatPrice } from '@/lib/utils';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  useEffect(() => { api.get('/admin/products?status=pending_review').then(r => setProducts(r.data.data ?? [])).catch(() => {}); }, []);

  const approve = async (id: number) => {
    await api.put(`/admin/products/${id}/approve`);
    setProducts(p => p.filter(p => p.id !== id));
  };
  const reject = async (id: number) => {
    const reason = window.prompt('Motif de refus (optionnel):') ?? '';
    await api.put(`/admin/products/${id}/reject`, { reason });
    setProducts(p => p.filter(p => p.id !== id));
  };

  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-dark mb-8">Produits en attente de validation</h1>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>{['Produit', 'Vendeur', 'Prix', 'Actions'].map(h => <th key={h} className="px-4 py-3 text-left font-semibold text-gray-600">{h}</th>)}</tr>
          </thead>
          <tbody className="divide-y">
            {products.map(p => (
              <tr key={p.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-dark">{p.name}</td>
                <td className="px-4 py-3 text-gray-500">{p.vendor?.store_name}</td>
                <td className="px-4 py-3 text-gray-600">{formatPrice(p.price)}</td>
                <td className="px-4 py-3 flex gap-2">
                  <button onClick={() => approve(p.id)} className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded hover:bg-green-100">Approuver</button>
                  <button onClick={() => reject(p.id)} className="text-xs bg-red-50 text-red-700 px-2 py-1 rounded hover:bg-red-100">Refuser</button>
                </td>
              </tr>
            ))}
            {products.length === 0 && <tr><td colSpan={4} className="px-4 py-10 text-center text-gray-400">Aucun produit en attente</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
