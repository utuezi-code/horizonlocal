<?php

namespace App\Jobs;

use App\Models\Order;
use App\Models\Vendor;
use App\Notifications\NewOrderForVendorNotification;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class NotifyVendorNewOrder implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(
        public readonly Order $order,
        public readonly Vendor $vendor
    ) {
    }

    public function handle(): void
    {
        $this->vendor->user->notify(new NewOrderForVendorNotification($this->order, $this->vendor));
    }
}
