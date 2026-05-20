'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [form, setForm] = useState({
    name: '', email: '', password: '', password_confirmation: '',
    is_vendor: false, store_name: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(form);
      router.push('/my-account');
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { errors?: Record<string, string[]>; message?: string } } };
      const validationErrors = axiosErr.response?.data?.errors;
      if (validationErrors) {
        setError(Object.values(validationErrors).flat().join(' '));
      } else {
        setError(axiosErr.response?.data?.message ?? 'Une erreur est survenue. Veuillez réessayer.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow">
        <div>
          <h2 className="text-3xl font-bold text-center text-dark">Créer un compte</h2>
          <p className="mt-2 text-center text-gray-600">Rejoignez Horizon Local</p>
        </div>
        <form className="space-y-5" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-dark mb-1">Nom complet</label>
            <input
              type="text" name="name" required value={form.name} onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Marie Tremblay"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-dark mb-1">Adresse courriel</label>
            <input
              type="email" name="email" required value={form.email} onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="vous@exemple.ca"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-dark mb-1">Mot de passe</label>
            <input
              type="password" name="password" required value={form.password} onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-dark mb-1">Confirmer le mot de passe</label>
            <input
              type="password" name="password_confirmation" required value={form.password_confirmation} onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox" name="is_vendor" id="is_vendor" checked={form.is_vendor} onChange={handleChange}
              className="h-4 w-4 text-primary rounded border-gray-300"
            />
            <label htmlFor="is_vendor" className="text-sm text-dark">Je suis un vendeur (entreprise québécoise)</label>
          </div>
          {form.is_vendor && (
            <div>
              <label className="block text-sm font-medium text-dark mb-1">Nom de la boutique</label>
              <input
                type="text" name="store_name" value={form.store_name} onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Colorantic Inc."
              />
            </div>
          )}
          <button
            type="submit" disabled={loading}
            className="w-full bg-primary text-white py-2 px-4 rounded-md font-semibold hover:bg-primary-600 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Inscription...' : "S'inscrire"}
          </button>
        </form>
        <p className="text-center text-gray-600">
          Déjà un compte ?{' '}
          <Link href="/login" className="text-primary font-semibold hover:underline">Se connecter</Link>
        </p>
      </div>
    </div>
  );
}
