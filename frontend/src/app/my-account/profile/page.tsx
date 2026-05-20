'use client';

import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';

export default function ProfilePage() {
  const { user, setUser } = useAuthStore();
  const [form, setForm] = useState({ name: user?.name ?? '', phone: user?.phone ?? '' });
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.put('/privacy/correction', form);
      setUser({ ...user!, ...form });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container mx-auto px-4 py-10 max-w-lg">
      <h1 className="text-3xl font-bold text-dark mb-8">Mon profil</h1>
      <form className="bg-white rounded-lg shadow p-6 space-y-5" onSubmit={handleSubmit}>
        {saved && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
            Profil mis à jour avec succès.
          </div>
        )}
        <div>
          <label className="block text-sm font-medium text-dark mb-1">Nom complet</label>
          <input
            type="text" value={form.name} onChange={(e) => setForm(p => ({ ...p, name: e.target.value }))}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-dark mb-1">Courriel</label>
          <input type="email" value={user?.email ?? ''} disabled
            className="w-full border border-gray-200 bg-gray-50 rounded-md px-3 py-2 text-gray-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-dark mb-1">Téléphone</label>
          <input
            type="tel" value={form.phone} onChange={(e) => setForm(p => ({ ...p, phone: e.target.value }))}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="514 555-1234"
          />
        </div>
        <button type="submit" disabled={loading}
          className="w-full bg-primary text-white py-2 rounded-md font-semibold hover:bg-primary-600 disabled:opacity-50 transition-colors">
          {loading ? 'Sauvegarde...' : 'Sauvegarder'}
        </button>
      </form>
    </div>
  );
}
