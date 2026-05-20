import { formatPrice } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface PriceDisplayProps {
  price: number;
  comparePrice?: number;
  currency?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function PriceDisplay({
  price,
  comparePrice,
  currency = 'CAD',
  size = 'md',
  className,
}: PriceDisplayProps) {
  const sizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-xl',
  };

  return (
    <div className={cn('flex items-center gap-2 flex-wrap', className)}>
      <span className={cn('font-bold text-[#1c61e7]', sizes[size])}>
        {formatPrice(price, currency)}
      </span>
      {comparePrice && comparePrice > price && (
        <span className={cn('text-gray-400 line-through', sizes[size])}>
          {formatPrice(comparePrice, currency)}
        </span>
      )}
      {comparePrice && comparePrice > price && (
        <span className="text-xs font-medium text-green-600 bg-green-50 px-1.5 py-0.5 rounded">
          -{Math.round(((comparePrice - price) / comparePrice) * 100)}%
        </span>
      )}
    </div>
  );
}
