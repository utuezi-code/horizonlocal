import Link from 'next/link';
import { Search } from 'lucide-react';

const mockStores = [
  { name: 'Saveurs du Nord', slug: 'saveurs-du-nord', city: 'Chicoutimi', province: 'QC', products: 45, description: 'Produits alimentaires artisanaux du Saguenay.' },
  { name: 'Mode Montréal', slug: 'mode-montreal', city: 'Montréal', province: 'QC', products: 120, description: 'Vêtements et accessoires de créateurs montréalais.' },
  { name: 'Artisans Québécois', slug: 'artisans-quebecois', city: 'Québec', province: 'QC', products: 78, description: 'Artisanat traditionnel et contemporain.' },
  { name: 'Nature & Bio QC', slug: 'nature-bio-qc', city: 'Sherbrooke', province: 'QC', products: 34, description: 'Produits naturels et biologiques des Cantons-de-l\'Est.' },
  { name: 'Bois & Création', slug: 'bois-creation', city: 'Trois-Rivières', province: 'QC', products: 22, description: 'Meubles et objets en bois faits à la main.' },
  { name: 'La Confiserie', slug: 'la-confiserie', city: 'Laval', province: 'QC', products: 56, description: 'Chocolats et confiseries artisanaux.' },
];

export default function StoresPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-gray-900">Nos boutiques partenaires</h1>
        <p className="text-gray-600 mt-2">
          Découvrez {mockStores.length} boutiques d&apos;entrepreneurs québécois
        </p>
      </div>

      {/* Search */}
      <div className="max-w-md mx-auto mb-8">
        <div className="relative">
          <input
            type="text"
            placeholder="Rechercher une boutique..."
            className="w-full rounded-full border border-gray-200 px-4 py-2.5 pl-10 text-sm focus:border-[#1c61e7] focus:outline-none focus:ring-2 focus:ring-[#1c61e7]/20"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockStores.map((store) => (
          <Link
            key={store.slug}
            href={`/stores/${store.slug}`}
            className="group bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300"
          >
            <div className="h-24 bg-gradient-to-r from-[#1c61e7] to-[#1648b0]" />
            <div className="relative px-4 pb-4">
              <div className="absolute -top-8 left-4 w-16 h-16 rounded-full border-4 border-white bg-[#eff6ff] flex items-center justify-center shadow-md">
                <span className="text-2xl font-bold text-[#1c61e7]">
                  {store.name.charAt(0)}
                </span>
              </div>
              <div className="pt-10">
                <h3 className="font-bold text-gray-900 group-hover:text-[#1c61e7] transition-colors">
                  {store.name}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  {store.city}, {store.province}
                </p>
                <p className="text-xs text-gray-600 mt-2 line-clamp-2">{store.description}</p>
                <p className="text-xs text-gray-400 mt-2">{store.products} produits</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
