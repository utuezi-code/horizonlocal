<?php

namespace App\Services;

use App\Models\Cart;
use App\Models\VendorShippingZone;

class ShippingCalculator
{
    /**
     * Calculate shipping fees per vendor for the given cart and province.
     *
     * @return array<int, array{vendor_id: int, fee: float, zone_name: string, estimated_days_min: int, estimated_days_max: int}>
     */
    public function calculate(Cart $cart, string $province): array
    {
        $results = [];

        $itemsByVendor = $cart->items()->with(['product.vendor'])->get()->groupBy(function ($item) {
            return $item->product->vendor_id;
        });

        foreach ($itemsByVendor as $vendorId => $items) {
            $vendor = $items->first()->product->vendor;

            $zone = VendorShippingZone::where('vendor_id', $vendorId)
                ->where('is_active', true)
                ->whereJsonContains('provinces', strtoupper($province))
                ->first();

            if (!$zone) {
                // Fall back to a zone with no province restriction
                $zone = VendorShippingZone::where('vendor_id', $vendorId)
                    ->where('is_active', true)
                    ->first();
            }

            if (!$zone) {
                $results[] = [
                    'vendor_id' => $vendorId,
                    'vendor_name' => $vendor->store_name,
                    'fee' => 0.0,
                    'zone_name' => 'Standard',
                    'estimated_days_min' => 3,
                    'estimated_days_max' => 7,
                ];
                continue;
            }

            $subtotal = $items->sum(function ($item) {
                return (float) ($item->variant?->price ?? $item->product->price) * $item->quantity;
            });

            $totalWeight = $items->sum(function ($item) {
                return (float) ($item->product->weight_kg ?? 0) * $item->quantity;
            });

            $fee = (float) $zone->base_fee;
            $fee += $totalWeight * (float) $zone->per_kg_fee;

            if ($zone->free_above !== null && $subtotal >= (float) $zone->free_above) {
                $fee = 0.0;
            }

            $results[] = [
                'vendor_id' => $vendorId,
                'vendor_name' => $vendor->store_name,
                'fee' => round($fee, 2),
                'zone_name' => $zone->zone_name,
                'estimated_days_min' => $zone->estimated_days_min,
                'estimated_days_max' => $zone->estimated_days_max,
            ];
        }

        return $results;
    }
}
