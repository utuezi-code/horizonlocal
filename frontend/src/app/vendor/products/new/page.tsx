'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Category } from '@/types';

export default function NewProductPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState({
    name: '', description: '', price: '', compare_price: '',
    stock: '', sku: '', category_id: '', short_description: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { api.get('/categories').then(r => setCategories(r.data ?? [])).catch(() => {}); }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      await api.post('/vendor/products', {
        ...form, price: parseFloat(form.price),
        compare_price: form.compare_price ? parseFloat(form.compare_price) : null,
        stock: parseInt(form.stock) || 0,
        category_id: parseInt(form.category_id),
      });
      router.push('/vendor/products');
    } catch (err: unknown) {
      setError('Erreur lors de la création du produit.');
    } finally {
      setLoading(false);
    }
  }

  const field = (name: keyof typeof form, label: string, type = 'text', required = false) => (
    <div key={name}>
      <label className="block text-sm font-medium text-dark mb-1">{label}{required && ' *'}</label>
      <input type={type} required={required} value={form[name]}
        onChange={(e) => setForm(p => ({ ...p, [name]: e.target.value }))}
        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
      />
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-10 max-w-2xl">
      <h1 className="text-3xl font-bold text-dark mb-8">Nouveau produit</h1>
      <form className="bg-white rounded-lg shadow p-6 space-y-5" onSubmit={handleSubmit}>
        {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">{error}</div>}
        {field('name', 'Nom du produit', 'text', true)}
        <div>
          <label className="block text-sm font-medium text-dark mb-1">Description courte</label>
          <textarea value={form.short_description} onChange={e => setForm(p => ({...p, short_description: e.target.value}))}
            rows={2} className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary" />
        </div>
        <div>
          <label className="block text-sm font-medium text-dark mb-1">Description complète</label>
          <textarea value={form.description} onChange={e => setForm(p => ({...p, description: e.target.value}))}
            rows={5} className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          {field('price', 'Prix (CAD) *', 'number', true)}
          {field('compare_price', 'Prix barré (CAD)', 'number')}
        </div>
        <div className="grid grid-cols-2 gap-4">
          {field('stock', 'Stock', 'number')}
          {field('sku', 'SKU')}
        </div>
        <div>
          <label className="block text-sm font-medium text-dark mb-1">Catégorie *</label>
          <select required value={form.category_id} onChange={e => setForm(p => ({...p, category_id: e.target.value}))}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary">
            <option value="">Choisir une catégorie</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div className="flex gap-4 pt-4">
          <button type="submit" disabled={loading}
            className="flex-1 bg-primary text-white py-2 rounded-md font-semibold hover:bg-primary-600 disabled:opacity-50 transition-colors">
            {loading ? 'Création...' : 'Créer le produit'}
          </button>
          <button type="button" onClick={() => router.back()}
            className="flex-1 border border-gray-300 py-2 rounded-md font-semibold hover:bg-gray-50 transition-colors">
            Annuler
          </button>
        </div>
      </form>
    </div>
  );
}
