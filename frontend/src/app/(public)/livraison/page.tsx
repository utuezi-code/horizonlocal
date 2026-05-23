import Link from 'next/link';
import { Truck, Clock, MapPin, Package, RotateCcw, ShieldCheck } from 'lucide-react';

const ZONES = [
  { region: 'Montréal & environs', delay: '1–2 jours ouvrables', price: '5,99 $' },
  { region: 'Reste du Québec', delay: '2–4 jours ouvrables', price: '7,99 $' },
  { region: 'Ontario & Maritimes', delay: '3–6 jours ouvrables', price: '12,99 $' },
  { region: 'Reste du Canada', delay: '5–10 jours ouvrables', price: '15,99 $' },
];

export default function LivraisonPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <nav className="text-sm text-gray-500 mb-6 flex items-center gap-2">
        <Link href="/" className="hover:text-[#1c61e7]">Accueil</Link>
        <span>/</span>
        <span className="text-gray-900 font-medium">Livraison</span>
      </nav>

      <h1 className="text-3xl font-bold text-gray-900 mb-2">Livraison & expédition</h1>
      <p className="text-gray-600 mb-10">Tout ce que vous devez savoir sur la livraison de vos commandes.</p>

      {/* Free shipping banner */}
      <div className="bg-gradient-to-r from-[#1c61e7] to-[#1648b0] rounded-2xl p-6 text-white mb-10 flex items-center gap-4">
        <Truck className="h-10 w-10 flex-shrink-0" />
        <div>
          <p className="text-lg font-bold">Livraison gratuite dès 75 $</p>
          <p className="text-sm opacity-90">Sur toutes les commandes au Canada avec un sous-total de 75 $ ou plus.</p>
        </div>
      </div>

      {/* Zones table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden mb-10">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <MapPin className="h-5 w-5 text-[#1c61e7]" />
            Zones et délais de livraison
          </h2>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-6 py-3 text-gray-500 font-medium">Région</th>
              <th className="text-left px-6 py-3 text-gray-500 font-medium">Délai estimé</th>
              <th className="text-left px-6 py-3 text-gray-500 font-medium">Frais</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {ZONES.map((z) => (
              <tr key={z.region}>
                <td className="px-6 py-3 text-gray-900 font-medium">{z.region}</td>
                <td className="px-6 py-3 text-gray-600">{z.delay}</td>
                <td className="px-6 py-3 text-gray-600">{z.price}</td>
              </tr>
            ))}
            <tr className="bg-[#eff6ff]">
              <td className="px-6 py-3 text-[#1c61e7] font-semibold">Tout le Canada</td>
              <td className="px-6 py-3 text-[#1c61e7]">Variable</td>
              <td className="px-6 py-3 text-[#1c61e7] font-semibold">Gratuit dès 75 $</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Info cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        {[
          { icon: Clock, title: 'Traitement', desc: 'Les commandes sont traitées sous 24 h les jours ouvrables.' },
          { icon: Package, title: 'Suivi', desc: 'Un numéro de suivi vous est envoyé par courriel dès l\'expédition.' },
          { icon: ShieldCheck, title: 'Assurance', desc: 'Toutes les commandes sont assurées jusqu\'à destination.' },
        ].map(({ icon: Icon, title, desc }) => (
          <div key={title} className="bg-white rounded-xl border border-gray-100 p-4">
            <Icon className="h-6 w-6 text-[#1c61e7] mb-2" />
            <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
            <p className="text-sm text-gray-600">{desc}</p>
          </div>
        ))}
      </div>

      {/* Returns */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-3">
          <RotateCcw className="h-5 w-5 text-[#1c61e7]" />
          Politique de retour
        </h2>
        <ul className="space-y-2 text-sm text-gray-600">
          <li>• Retours acceptés dans les <strong>30 jours</strong> suivant la réception.</li>
          <li>• L&apos;article doit être dans son état d&apos;origine, non utilisé et dans son emballage d&apos;origine.</li>
          <li>• Les frais de retour sont à la charge du client, sauf en cas de produit défectueux.</li>
          <li>• Le remboursement est effectué dans les 5–10 jours ouvrables suivant la réception du retour.</li>
        </ul>
      </div>

      <div className="mt-8 text-center">
        <Link href="/shop" className="inline-flex items-center gap-2 bg-[#1c61e7] text-white font-semibold px-6 py-3 rounded-xl hover:bg-[#1648b0] transition-colors">
          <Truck className="h-4 w-4" />
          Magasiner maintenant
        </Link>
      </div>
    </div>
  );
}
