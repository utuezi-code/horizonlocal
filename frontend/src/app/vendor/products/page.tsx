'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { Product } from '@/types';
import { formatPrice } from '@/lib/utils';

const STATUS = { draft: 'Brouillon', pending_review: 'En révision', published: 'Publié', rejected: 'Refusé', archived: 'Archivé' };
const STATUS_COLOR: Record<string, string> = { draft: 'bg-gray-100 text-gray-600', pending_review: 'bg-yellow-100 text-yellow-700', published: 'bg-green-100 text-green-700', rejected: 'bg-red-100 text-red-700', archived: 'bg-gray-100 text-gray-500' };

export default function VendorProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  useEffect(() => { api.get('/vendor/products').then(r => setProducts(r.data.data ?? [])).catch(() => {}); }, []);

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-dark">Mes produits</h1>
        <Link href="/vendor/products/new" className="bg-primary text-white px-4 py-2 rounded-md font-semibold hover:bg-primary-600 transition-colors">+ Nouveau produit</Link>
      </div>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>{['Produit', 'Prix', 'Stock', 'Statut', 'Actions'].map(h => <th key={h} className="px-4 py-3 text-left font-semibold text-gray-600">{h}</th>)}</tr>
          </thead>
          <tbody className="divide-y">
            {products.map(p => (
              <tr key={p.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-dark">{p.name}</td>
                <td className="px-4 py-3 text-gray-600">{formatPrice(p.price)}</td>
                <td className="px-4 py-3 text-gray-600">{p.stock}</td>
                <td className="px-4 py-3"><span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLOR[p.status]}`}>{STATUS[p.status] ?? p.status}</span></td>
                <td className="px-4 py-3"><Link href={`/vendor/products/${p.id}/edit`} className="text-primary hover:underline text-xs">Modifier</Link></td>
              </tr>
            ))}
            {products.length === 0 && <tr><td colSpan={5} className="px-4 py-10 text-center text-gray-400">Aucun produit</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
