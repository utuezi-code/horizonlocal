'use client';

import { useState } from 'react';
import { Copy, Check } from 'lucide-react';

export function CopyCodeButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback for browsers without clipboard API
      const el = document.createElement('textarea');
      el.value = code;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="flex items-center justify-between w-full bg-gray-50 rounded-lg px-4 py-3 hover:bg-gray-100 transition-colors group"
      title="Cliquer pour copier"
    >
      <span className="text-sm text-gray-500">Code promo :</span>
      <div className="flex items-center gap-2">
        <code className="font-mono font-bold text-[#1c61e7] tracking-wider">{code}</code>
        {copied
          ? <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
          : <Copy className="h-4 w-4 text-gray-400 group-hover:text-[#1c61e7] flex-shrink-0 transition-colors" />
        }
      </div>
    </button>
  );
}
