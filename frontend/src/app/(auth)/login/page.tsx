'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      router.push('/my-account');
    } catch {
      setError('Courriel ou mot de passe invalide.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow">
        <div>
          <h2 className="text-3xl font-bold text-center text-dark">Se connecter</h2>
          <p className="mt-2 text-center text-gray-600">
            Bienvenue sur{' '}
            <span className="text-primary font-semibold">Horizon Local</span>
          </p>
        </div>
        <form className="space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-dark mb-1">
              Adresse courriel
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="vous@exemple.ca"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-dark mb-1">
              Mot de passe
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <div className="text-right mt-1">
              <Link href="/forgot-password" className="text-sm text-primary hover:underline">
                Mot de passe oublié ?
              </Link>
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white py-2 px-4 rounded-md font-semibold hover:bg-primary-600 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>
        <p className="text-center text-gray-600">
          Pas encore de compte ?{' '}
          <Link href="/register" className="text-primary font-semibold hover:underline">
            S&apos;inscrire
          </Link>
        </p>
      </div>
    </div>
  );
}
