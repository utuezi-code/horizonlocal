'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Product } from '@/types';

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [form, setForm] = useState({ name: '', price: '', stock: '', status: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    params.then(({ id }) => {
      api.get(`/vendor/products/${id}`).then(r => {
        setProduct(r.data);
        setForm({ name: r.data.name, price: String(r.data.price), stock: String(r.data.stock), status: r.data.status });
      }).catch(() => {});
    });
  }, [params]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!product) return;
    setLoading(true);
    try {
      await api.put(`/vendor/products/${product.id}`, { ...form, price: parseFloat(form.price), stock: parseInt(form.stock) });
      router.push('/vendor/products');
    } finally { setLoading(false); }
  }

  if (!product) return <div className="container mx-auto px-4 py-20 text-center text-gray-500">Chargement...</div>;

  return (
    <div className="container mx-auto px-4 py-10 max-w-2xl">
      <h1 className="text-3xl font-bold text-dark mb-8">Modifier : {product.name}</h1>
      <form className="bg-white rounded-lg shadow p-6 space-y-5" onSubmit={handleSubmit}>
        {[
          { field: 'name' as const, label: 'Nom', type: 'text' },
          { field: 'price' as const, label: 'Prix (CAD)', type: 'number' },
          { field: 'stock' as const, label: 'Stock', type: 'number' },
        ].map(({ field, label, type }) => (
          <div key={field}>
            <label className="block text-sm font-medium text-dark mb-1">{label}</label>
            <input type={type} value={form[field]} onChange={e => setForm(p => ({ ...p, [field]: e.target.value }))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary" />
          </div>
        ))}
        <div className="flex gap-4 pt-4">
          <button type="submit" disabled={loading}
            className="flex-1 bg-primary text-white py-2 rounded-md font-semibold hover:bg-primary-600 disabled:opacity-50 transition-colors">
            {loading ? 'Sauvegarde...' : 'Sauvegarder'}
          </button>
          {product.status === 'draft' || product.status === 'rejected' ? (
            <button type="button"
              onClick={() => api.post(`/vendor/products/${product.id}/submit`).then(() => router.push('/vendor/products'))}
              className="flex-1 border border-primary text-primary py-2 rounded-md font-semibold hover:bg-primary hover:text-white transition-colors">
              Soumettre pour révision
            </button>
          ) : null}
        </div>
      </form>
    </div>
  );
}
