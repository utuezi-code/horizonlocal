interface StockBadgeProps {
  stock: number;
}

export function StockBadge({ stock }: StockBadgeProps) {
  if (stock === 0) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
        <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
        Épuisé
      </span>
    );
  }

  if (stock <= 5) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-700">
        <span className="h-1.5 w-1.5 rounded-full bg-orange-500" />
        Stock faible ({stock})
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
      <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
      En stock
    </span>
  );
}
