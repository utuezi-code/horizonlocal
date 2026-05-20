<?php

namespace App\Observers;

use App\Jobs\ProcessStripeTransfer;
use App\Jobs\SendReviewRequestEmail;
use App\Models\OrderItem;
use App\Notifications\ItemCancelledNotification;
use App\Notifications\ItemDeliveredNotification;
use App\Notifications\ItemShippedNotification;

class OrderItemObserver
{
    public function updating(OrderItem $orderItem): void
    {
        if (!$orderItem->isDirty('fulfillment_status')) {
            return;
        }

        $newStatus = $orderItem->fulfillment_status;
        $customer = $orderItem->order?->customer;
        $vendor = $orderItem->vendor;

        switch ($newStatus) {
            case 'shipped':
                if ($customer) {
                    $customer->notify(new ItemShippedNotification($orderItem));
                }
                if ($vendor) {
                    // TODO: Notify vendor that item was marked as shipped
                }
                break;

            case 'delivered':
                if ($customer) {
                    $customer->notify(new ItemDeliveredNotification($orderItem));

                    // Schedule review request email 3 days after delivery
                    SendReviewRequestEmail::dispatch($orderItem->order)->delay(now()->addDays(3));
                }

                // Process Stripe transfer to vendor
                ProcessStripeTransfer::dispatch($orderItem);
                break;

            case 'cancelled':
                if ($customer) {
                    $customer->notify(new ItemCancelledNotification($orderItem));
                }
                if ($vendor) {
                    // TODO: Notify vendor that item was cancelled
                }
                break;

            case 'refunded':
                if ($customer) {
                    // TODO: Notify customer of refund
                }
                break;
        }
    }
}
