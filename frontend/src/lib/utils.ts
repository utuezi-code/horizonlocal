import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(amount: number, currency = 'CAD'): string {
  return new Intl.NumberFormat('fr-CA', {
    style: 'currency',
    currency,
  }).format(amount);
}

export function formatDate(date: string): string {
  return new Intl.DateTimeFormat('fr-CA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date));
}

export function findVariant(
  selectedValues: number[],
  variants: { id: number; attribute_value_ids: number[] }[]
) {
  return variants.find(
    (v) =>
      selectedValues.every((valId) => v.attribute_value_ids.includes(valId)) &&
      v.attribute_value_ids.length === selectedValues.length
  );
}

export function getTrackingUrl(carrier: string, trackingNumber: string): string {
  const carriers: Record<string, string> = {
    canada_post: `https://www.canadapost-postescanada.ca/track-reperage/en#/details/${trackingNumber}`,
    purolator: `https://eshiponline.purolator.com/ShipOnline/Welcome.aspx?Tracking=${trackingNumber}`,
    ups: `https://www.ups.com/track?tracknum=${trackingNumber}`,
    fedex: `https://www.fedex.com/fedextrack/?trknbr=${trackingNumber}`,
  };
  return carriers[carrier] || `#${trackingNumber}`;
}
