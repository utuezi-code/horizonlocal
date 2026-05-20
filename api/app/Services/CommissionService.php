<?php

namespace App\Services;

use App\Jobs\ProcessStripeTransfer;
use App\Models\OrderItem;

class CommissionService
{
    /**
     * Calculate commission and vendor amount for a given price and rate.
     *
     * @return array{vendor_amount: float, commission_amount: float}
     */
    public function calculate(float $price, float $commissionRate): array
    {
        $commissionAmount = round($price * ($commissionRate / 100), 2);
        $vendorAmount = round($price - $commissionAmount, 2);

        return [
            'vendor_amount' => $vendorAmount,
            'commission_amount' => $commissionAmount,
        ];
    }

    /**
     * Dispatch a job to process the Stripe transfer for an order item.
     */
    public function processTransfer(OrderItem $orderItem): void
    {
        ProcessStripeTransfer::dispatch($orderItem);
    }
}
