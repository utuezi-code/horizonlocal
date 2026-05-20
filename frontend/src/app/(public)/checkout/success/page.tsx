import Link from 'next/link';
import { CheckCircle, Package, ArrowRight } from 'lucide-react';

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>;
}) {
  const { order } = await searchParams;

  return (
    <div className="max-w-lg mx-auto px-4 py-20 text-center">
      <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-6">
        <CheckCircle className="h-10 w-10 text-green-500" />
      </div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Merci pour votre commande !</h1>
      <p className="text-gray-500 mb-2">
        Votre commande a été passée avec succès. Vous recevrez un email de confirmation sous peu.
      </p>
      {order && (
        <p className="text-sm font-mono bg-gray-50 border border-gray-100 rounded-lg px-4 py-2 inline-block mb-6 text-gray-700">
          Commande n° <strong className="text-[#1c61e7]">#{order}</strong>
        </p>
      )}
      <div className="flex flex-col sm:flex-row gap-3 justify-center mt-4">
        <Link
          href={`/my-account/orders${order ? `/${order}` : ''}`}
          className="inline-flex items-center justify-center gap-2 bg-[#1c61e7] text-white font-semibold px-6 py-3 rounded-xl hover:bg-[#1648b0] transition-colors"
        >
          <Package className="h-4 w-4" /> Suivre ma commande
        </Link>
        <Link
          href="/shop"
          className="inline-flex items-center justify-center gap-2 border border-gray-200 text-gray-700 font-semibold px-6 py-3 rounded-xl hover:bg-gray-50 transition-colors"
        >
          Continuer mes achats <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
