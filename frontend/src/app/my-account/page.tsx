'use client';

import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';

export default function MyAccountPage() {
  const { user } = useAuthStore();

  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-dark mb-2">Mon compte</h1>
      {user && <p className="text-gray-600 mb-8">Bonjour, {user.name} !</p>}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          { href: '/my-account/orders', label: 'Mes commandes', icon: '📦', desc: 'Suivre vos commandes' },
          { href: '/my-account/profile', label: 'Mon profil', icon: '👤', desc: 'Gérer vos informations' },
          { href: '/favoris', label: 'Mes favoris', icon: '❤️', desc: 'Produits sauvegardés' },
        ].map((item) => (
          <Link key={item.href} href={item.href} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
            <div className="text-3xl mb-3">{item.icon}</div>
            <h3 className="font-bold text-dark">{item.label}</h3>
            <p className="text-sm text-gray-500 mt-1">{item.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
