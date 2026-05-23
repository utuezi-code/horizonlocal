'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { ChevronDown } from 'lucide-react';

const SORT_OPTIONS = [
  { value: 'created_at|desc', label: 'Plus récents' },
  { value: 'price|asc',       label: 'Prix croissant' },
  { value: 'price|desc',      label: 'Prix décroissant' },
  { value: 'name|asc',        label: 'Nom A-Z' },
];

export function ShopSortSelect({ currentSort, basePath = '/shop' }: { currentSort: string; basePath?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const [sortBy, sortDir] = e.target.value.split('|');
    const params = new URLSearchParams(searchParams.toString());
    params.set('sort_by', sortBy);
    params.set('sort_dir', sortDir);
    params.delete('page');
    router.push(`${basePath}?${params.toString()}`);
  };

  return (
    <div className="relative">
      <select
        value={currentSort}
        onChange={handleChange}
        className="appearance-none bg-white border border-gray-200 rounded-lg px-3 py-1.5 pr-8 text-sm text-gray-700 focus:border-[#1c61e7] focus:outline-none cursor-pointer"
      >
        {SORT_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
    </div>
  );
}
