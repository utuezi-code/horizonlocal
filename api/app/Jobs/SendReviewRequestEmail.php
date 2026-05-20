<?php

namespace App\Jobs;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class SendReviewRequestEmail implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(public readonly Order $order)
    {
        // Delay the job by 3 days
        $this->delay(now()->addDays(3));
    }

    public function handle(): void
    {
        // TODO: Send review request email to the customer
        // The customer is reminded to leave a review for their delivered order
        $customer = $this->order->customer;

        if (!$customer) {
            return;
        }

        // Send review request for each item in the order
        foreach ($this->order->items()->with('product')->get() as $item) {
            // TODO: Notify customer to review each product
        }
    }
}
