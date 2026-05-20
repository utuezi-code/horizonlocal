<?php

namespace App\Http\Controllers\Checkout;

use App\Http\Controllers\Controller;
use App\Jobs\SendOrderConfirmationEmail;
use App\Jobs\NotifyVendorNewOrder;
use App\Models\Cart;
use App\Models\Order;
use App\Services\CommissionService;
use App\Services\TaxService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Stripe\Webhook;

class StripeController extends Controller
{
    public function webhook(Request $request): JsonResponse
    {
        $payload = $request->getContent();
        $sigHeader = $request->header('Stripe-Signature');
        $secret = config('services.stripe.webhook_secret');

        try {
            $event = Webhook::constructEvent($payload, $sigHeader, $secret);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Signature invalide.'], 400);
        }

        match ($event->type) {
            'payment_intent.succeeded'       => $this->handlePaymentSucceeded($event->data->object),
            'payment_intent.payment_failed'  => $this->handlePaymentFailed($event->data->object),
            default                          => null,
        };

        return response()->json(['received' => true]);
    }

    private function handlePaymentSucceeded(object $paymentIntent): void
    {
        $order = Order::where('stripe_payment_intent_id', $paymentIntent->id)->first();

        if (!$order || $order->status !== 'pending_payment') {
            return;
        }

        $order->update(['status' => 'payment_confirmed']);

        // Notify customer and vendors
        SendOrderConfirmationEmail::dispatch($order);

        foreach ($order->items->unique('vendor_id') as $item) {
            NotifyVendorNewOrder::dispatch($order, $item->vendor_id);
        }
    }

    private function handlePaymentFailed(object $paymentIntent): void
    {
        $order = Order::where('stripe_payment_intent_id', $paymentIntent->id)->first();

        if ($order) {
            $order->update(['status' => 'cancelled']);
        }
    }
}
