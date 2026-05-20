'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Check, Package, Truck, Home, Clock, XCircle, RotateCcw, RefreshCw, ChevronLeft, ExternalLink } from 'lucide-react';
import api from '@/lib/api';

const fmt = (n: number) =>
  new Intl.NumberFormat('fr-CA', { style: 'currency', currency: 'CAD' }).format(n);

const fmtDate = (d: string) =>
  new Date(d).toLocaleString('fr-CA', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });

const TIMELINE = [
  { status: 'pending',    label: 'Commande reçue',   icon: Clock },
  { status: 'confirmed',  label: 'Confirmée',        icon: Check },
  { status: 'processing', label: 'En préparation',   icon: Package },
  { status: 'shipped',    label: 'Expédiée',         icon: Truck },
  { status: 'delivered',  label: 'Livrée',           icon: Home },
] as const;

const STATUS_ORDER = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];

const CARRIER_URLS: Record<string, string> = {
  canadapost: 'https://www.canadapost-postescanada.ca/track-reperage/fr#/details/{n}',
  purolator:  'https://www.purolator.com/fr/expedier/suivi-colis.page?pin={n}',
  fedex:      'https://www.fedex.com/fedextrack/?trknbr={n}',
  ups:        'https://www.ups.com/track?tracknum={n}',
};

const CARRIER_LABELS: Record<string, string> = {
  canadapost: 'Postes Canada',
  purolator:  'Purolator',
  fedex:      'FedEx',
  ups:        'UPS',
  autre:      'Autre transporteur',
};

type OrderItemType = {
  id: number;
  quantity: number;
  unit_price: number;
  total_price: number;
  product?: { id: number; name: string; slug: string; images?: { url: string }[] };
  vendor?: { store_name: string };
};

type OrderType = {
  id: number;
  status: string;
  subtotal: number;
  discount_amount?: number;
  coupon_code?: string;
  shipping_cost: number;
  tax_gst: number;
  tax_tvq: number;
  total: number;
  tracking_number?: string;
  carrier?: string;
  created_at: string;
  updated_at: string;
  shipping_address?: { name?: string; address?: string; city?: string; province?: string; postal_code?: string };
  items?: OrderItemType[];
};

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [order, setOrder] = useState<OrderType | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState('');

  useEffect(() => {
    api.get(`/my-account/orders/${id}`)
      .then(res => setOrder(res.data.order ?? res.data))
      .catch(() => router.push('/my-account/orders'))
      .finally(() => setLoading(false));
  }, [id, router]);

  if (loading) return <div className="max-w-3xl mx-auto px-4 py-16 text-center text-gray-400">Chargement…</div>;
  if (!order) return null;

  const stepIndex = STATUS_ORDER.indexOf(order.status);
  const canCancel = ['pending', 'confirmed'].includes(order.status);
  const canReturn = order.status === 'delivered';
  const trackingUrl = order.tracking_number && order.carrier && CARRIER_URLS[order.carrier]
    ? CARRIER_URLS[order.carrier].replace('{n}', order.tracking_number)
    : null;

  const handleCancel = async () => {
    if (!confirm('Voulez-vous vraiment annuler cette commande ?')) return;
    setActionLoading('cancel');
    try {
      const res = await api.post(`/my-account/orders/${id}/cancel`);
      setOrder(res.data.order);
    } finally { setActionLoading(''); }
  };

  const handleReturn = async () => {
    const reason = prompt('Raison du retour (optionnel) :');
    if (reason === null) return;
    setActionLoading('return');
    try {
      await api.post(`/my-account/orders/${id}/return`, { reason });
      alert('Demande de retour soumise. Un vendeur vous contactera sous 48h.');
      router.refresh();
    } finally { setActionLoading(''); }
  };

  const handleRebuy = async () => {
    setActionLoading('rebuy');
    try {
      await api.post(`/my-account/orders/${id}/rebuy`);
      router.push('/cart');
    } finally { setActionLoading(''); }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <Link href="/my-account/orders" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-[#1c61e7] mb-6 transition-colors">
        <ChevronLeft className="h-4 w-4" /> Mes commandes
      </Link>

      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-gray-900">Commande #{order.id}</h1>
        <span className="text-sm text-gray-500">{fmtDate(order.created_at)}</span>
      </div>

      {/* Timeline */}
      {!['cancelled', 'return_requested', 'refunded'].includes(order.status) && (
        <div className="bg-white border border-gray-100 rounded-xl p-6 mb-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-5">Suivi de la commande</h2>
          <div className="flex items-start justify-between relative">
            <div className="absolute top-4 left-4 right-4 h-0.5 bg-gray-100" style={{ zIndex: 0 }} />
            <div
              className="absolute top-4 left-4 h-0.5 bg-[#1c61e7] transition-all"
              style={{ width: stepIndex < 0 ? '0%' : `${(stepIndex / (TIMELINE.length - 1)) * (100 - 8)}%`, zIndex: 1 }}
            />
            {TIMELINE.map((step, i) => {
              const done = stepIndex >= i;
              const active = stepIndex === i;
              const Icon = step.icon;
              return (
                <div key={step.status} className="flex flex-col items-center gap-2 flex-1 relative z-10">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors ${
                    done ? 'bg-[#1c61e7] border-[#1c61e7] text-white' :
                    active ? 'border-[#1c61e7] bg-white' :
                    'border-gray-200 bg-white text-gray-300'
                  }`}>
                    <Icon className="h-3.5 w-3.5" />
                  </div>
                  <span className={`text-xs text-center leading-tight ${done ? 'text-gray-900 font-medium' : 'text-gray-400'}`}>
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tracking */}
      {order.tracking_number && (
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6 flex items-center gap-3">
          <Truck className="h-5 w-5 text-[#1c61e7] shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-gray-900">{CARRIER_LABELS[order.carrier ?? ''] ?? 'Transporteur'}</p>
            <p className="text-sm font-mono text-gray-600">{order.tracking_number}</p>
          </div>
          {trackingUrl && (
            <a href={trackingUrl} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1 text-sm text-[#1c61e7] font-medium hover:underline shrink-0">
              Suivre <ExternalLink className="h-3.5 w-3.5" />
            </a>
          )}
        </div>
      )}

      {/* Items */}
      <div className="border border-gray-100 rounded-xl overflow-hidden mb-6">
        <div className="bg-gray-50 px-4 py-3 border-b border-gray-100">
          <p className="text-sm font-semibold text-gray-700">Articles commandés</p>
        </div>
        <div className="divide-y divide-gray-50">
          {(order.items ?? []).map(item => (
            <div key={item.id} className="flex gap-4 p-4">
              <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 shrink-0 overflow-hidden">
                {item.product?.images?.[0]?.url ? (
                  <img src={item.product.images[0].url} alt={item.product.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xl">📦</div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <Link href={`/shop/${item.product?.slug ?? ''}`} className="text-sm font-medium text-gray-900 hover:text-[#1c61e7] line-clamp-2">
                  {item.product?.name}
                </Link>
                <p className="text-xs text-gray-500 mt-0.5">{item.vendor?.store_name ?? ''}</p>
                <p className="text-sm text-gray-600 mt-1">Qté : {item.quantity} × {fmt(item.unit_price)}</p>
              </div>
              <p className="text-sm font-bold text-gray-900 shrink-0">{fmt(item.total_price)}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Summary */}
      <div className="border border-gray-100 rounded-xl p-5 mb-6 space-y-2 text-sm">
        <div className="flex justify-between text-gray-600"><span>Sous-total</span><span>{fmt(order.subtotal)}</span></div>
        {order.discount_amount ? (
          <div className="flex justify-between text-green-600">
            <span>Rabais{order.coupon_code ? ` (${order.coupon_code})` : ''}</span>
            <span>−{fmt(order.discount_amount)}</span>
          </div>
        ) : null}
        <div className="flex justify-between text-gray-600"><span>Livraison</span><span>{order.shipping_cost === 0 ? 'Gratuite' : fmt(order.shipping_cost)}</span></div>
        <div className="flex justify-between text-gray-500"><span>TPS (5 %)</span><span>{fmt(order.tax_gst)}</span></div>
        <div className="flex justify-between text-gray-500"><span>TVQ (9,975 %)</span><span>{fmt(order.tax_tvq)}</span></div>
        <div className="flex justify-between font-bold text-gray-900 text-base pt-2 border-t border-gray-100 mt-1">
          <span>Total</span><span>{fmt(order.total)}</span>
        </div>
      </div>

      {/* Delivery address */}
      {order.shipping_address && (
        <div className="border border-gray-100 rounded-xl p-4 mb-6">
          <p className="text-sm font-semibold text-gray-700 mb-2">Adresse de livraison</p>
          <p className="text-sm text-gray-900">{order.shipping_address.name}</p>
          <p className="text-sm text-gray-600">{order.shipping_address.address}</p>
          <p className="text-sm text-gray-600">{order.shipping_address.city}, {order.shipping_address.province} {order.shipping_address.postal_code}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={handleRebuy}
          disabled={actionLoading === 'rebuy'}
          className="inline-flex items-center gap-2 border border-[#1c61e7] text-[#1c61e7] font-semibold px-5 py-2.5 rounded-xl hover:bg-[#eff6ff] transition-colors text-sm disabled:opacity-50"
        >
          <RefreshCw className="h-4 w-4" /> {actionLoading === 'rebuy' ? 'Ajout…' : 'Réacheter'}
        </button>
        {canReturn && (
          <button
            onClick={handleReturn}
            disabled={actionLoading === 'return'}
            className="inline-flex items-center gap-2 border border-gray-200 text-gray-700 font-semibold px-5 py-2.5 rounded-xl hover:bg-gray-50 transition-colors text-sm disabled:opacity-50"
          >
            <RotateCcw className="h-4 w-4" /> Demander un retour
          </button>
        )}
        {canCancel && (
          <button
            onClick={handleCancel}
            disabled={actionLoading === 'cancel'}
            className="inline-flex items-center gap-2 border border-red-200 text-red-600 font-semibold px-5 py-2.5 rounded-xl hover:bg-red-50 transition-colors text-sm disabled:opacity-50"
          >
            <XCircle className="h-4 w-4" /> {actionLoading === 'cancel' ? 'Annulation…' : 'Annuler la commande'}
          </button>
        )}
      </div>
    </div>
  );
}
