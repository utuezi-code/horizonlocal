'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { Category } from '@/types';
import { cn } from '@/lib/utils';

interface SidebarProps {
  categories?: Category[];
  onPriceChange?: (min: number, max: number) => void;
  onStockFilter?: (inStockOnly: boolean) => void;
  currentMin?: number;
  currentMax?: number;
  inStockOnly?: boolean;
}

function CategoryItem({ category, depth = 0 }: { category: Category; depth?: number }) {
  const [open, setOpen] = useState(false);
  const hasChildren = category.children && category.children.length > 0;

  return (
    <div>
      <div
        className={cn(
          'flex items-center justify-between rounded-lg px-3 py-2 text-sm hover:bg-gray-50 group',
          depth > 0 && 'ml-4'
        )}
      >
        <Link
          href={`/product-category/${category.slug}`}
          className="flex-1 text-gray-700 group-hover:text-[#1c61e7] transition-colors"
        >
          {category.name}
        </Link>
        {hasChildren && (
          <button
            onClick={() => setOpen(!open)}
            className="p-1 text-gray-400 hover:text-gray-600"
          >
            {open ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
          </button>
        )}
      </div>
      {hasChildren && open && (
        <div>
          {category.children!.map((child) => (
            <CategoryItem key={child.id} category={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export function Sidebar({
  categories = [],
  onPriceChange,
  onStockFilter,
  currentMin = 0,
  currentMax = 1000,
  inStockOnly = false,
}: SidebarProps) {
  const [minPrice, setMinPrice] = useState(currentMin);
  const [maxPrice, setMaxPrice] = useState(currentMax);

  const handlePriceApply = () => {
    onPriceChange?.(minPrice, maxPrice);
  };

  return (
    <aside className="w-64 flex-shrink-0 space-y-6">
      {/* Categories */}
      <div className="bg-white rounded-xl border border-gray-100 p-4">
        <h3 className="font-semibold text-gray-900 mb-3">Catégories</h3>
        {categories.length > 0 ? (
          <div className="space-y-0.5">
            {categories.map((cat) => (
              <CategoryItem key={cat.id} category={cat} />
            ))}
          </div>
        ) : (
          <div className="space-y-0.5">
            {['Alimentation', 'Mode', 'Maison', 'Beauté', 'Électronique', 'Sport'].map((name) => (
              <Link
                key={name}
                href={`/product-category/${name.toLowerCase()}`}
                className="block rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#1c61e7] transition-colors"
              >
                {name}
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Price Range */}
      <div className="bg-white rounded-xl border border-gray-100 p-4">
        <h3 className="font-semibold text-gray-900 mb-3">Prix</h3>
        <div className="space-y-3">
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="text-xs text-gray-500 mb-1 block">Min ($)</label>
              <input
                type="number"
                value={minPrice}
                onChange={(e) => setMinPrice(Number(e.target.value))}
                min={0}
                className="w-full rounded-lg border border-gray-200 px-2 py-1.5 text-sm focus:border-[#1c61e7] focus:outline-none"
              />
            </div>
            <div className="flex-1">
              <label className="text-xs text-gray-500 mb-1 block">Max ($)</label>
              <input
                type="number"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                min={0}
                className="w-full rounded-lg border border-gray-200 px-2 py-1.5 text-sm focus:border-[#1c61e7] focus:outline-none"
              />
            </div>
          </div>
          <button
            onClick={handlePriceApply}
            className="w-full rounded-lg bg-[#1c61e7] text-white text-sm py-2 hover:bg-[#1a56d0] transition-colors"
          >
            Appliquer
          </button>
        </div>
      </div>

      {/* Stock filter */}
      <div className="bg-white rounded-xl border border-gray-100 p-4">
        <h3 className="font-semibold text-gray-900 mb-3">Disponibilité</h3>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={inStockOnly}
            onChange={(e) => onStockFilter?.(e.target.checked)}
            className="rounded border-gray-300 text-[#1c61e7] focus:ring-[#1c61e7]"
          />
          <span className="text-sm text-gray-700">En stock uniquement</span>
        </label>
      </div>
    </aside>
  );
}
