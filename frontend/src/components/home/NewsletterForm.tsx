'use client';

import { useState } from 'react';
import { Mail, Check } from 'lucide-react';

interface NewsletterFormProps {
  variant?: 'section' | 'inline';
}

export function NewsletterForm({ variant = 'section' }: NewsletterFormProps) {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    // eslint-disable-next-line no-console
    console.log('[newsletter] subscribe', email);
    setSubmitted(true);
    setEmail('');
    setTimeout(() => setSubmitted(false), 4000);
  };

  if (variant === 'inline') {
    return (
      <form onSubmit={onSubmit} className="flex flex-col sm:flex-row gap-2 max-w-md w-full">
        <div className="relative flex-1">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="votre@courriel.ca"
            className="w-full rounded-lg border border-gray-700 bg-gray-800 text-white placeholder-gray-500 pl-10 pr-3 py-2.5 text-sm focus:border-[#1c61e7] focus:outline-none focus:ring-2 focus:ring-[#1c61e7]/30"
          />
        </div>
        <button
          type="submit"
          className="inline-flex items-center justify-center gap-2 bg-[#f97316] hover:bg-[#ea6c0a] text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors"
        >
          {submitted ? (<><Check className="h-4 w-4" /> Inscrit !</>) : "S'abonner"}
        </button>
      </form>
    );
  }

  return (
    <section className="py-14 bg-gradient-to-r from-[#1c61e7] to-[#1648b0] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-8 items-center">
        <div>
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-3 py-1 text-xs font-medium mb-3">
            <Mail className="h-3.5 w-3.5" />
            Infolettre
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">
            Recevez nos meilleures offres directement par courriel
          </h2>
          <p className="text-white/85 max-w-lg">
            Codes promo exclusifs, nouveautés et boutiques à découvrir. Pas de spam, promis.
          </p>
        </div>
        <form onSubmit={onSubmit} className="flex flex-col sm:flex-row gap-3 w-full">
          <div className="relative flex-1">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="votre@courriel.ca"
              className="w-full rounded-xl border border-white/30 bg-white/10 text-white placeholder-white/60 pl-10 pr-3 py-3 text-sm focus:bg-white focus:text-gray-900 focus:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/60"
            />
          </div>
          <button
            type="submit"
            className="inline-flex items-center justify-center gap-2 bg-[#f97316] hover:bg-[#ea6c0a] text-white font-semibold px-6 py-3 rounded-xl transition-colors shadow"
          >
            {submitted ? (<><Check className="h-4 w-4" /> Merci !</>) : "S'abonner"}
          </button>
        </form>
      </div>
    </section>
  );
}
