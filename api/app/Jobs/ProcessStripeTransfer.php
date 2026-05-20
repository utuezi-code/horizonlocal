<?php

namespace App\Jobs;

use App\Models\Commission;
use App\Models\OrderItem;
use App\Notifications\StripeTransferNotification;
use App\Services\StripeService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Throwable;

class ProcessStripeTransfer implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;

    public function __construct(public readonly OrderItem $orderItem)
    {
    }

    public function handle(StripeService $stripeService): void
    {
        $commission = $this->orderItem->commission;

        if (!$commission || $commission->status === 'transferred') {
            return;
        }

        try {
            $transfer = $stripeService->transferToVendor($this->orderItem);

            $commission->update([
                'stripe_transfer_id' => $transfer->id,
                'status' => 'transferred',
                'transferred_at' => now(),
            ]);

            $this->orderItem->vendor->user->notify(new StripeTransferNotification($commission));
        } catch (Throwable $e) {
            $commission->update(['status' => 'failed']);
            throw $e;
        }
    }
}
