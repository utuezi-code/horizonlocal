import Link from 'next/link';
import { cn } from '@/lib/utils';

interface CategoryBadgeProps {
  name: string;
  slug: string;
  className?: string;
}

export function CategoryBadge({ name, slug, className }: CategoryBadgeProps) {
  return (
    <Link
      href={`/product-category/${slug}`}
      className={cn(
        'inline-flex items-center rounded-full bg-[#eff6ff] px-2.5 py-0.5 text-xs font-medium text-[#1c61e7] hover:bg-[#dbeafe] transition-colors',
        className
      )}
    >
      {name}
    </Link>
  );
}
