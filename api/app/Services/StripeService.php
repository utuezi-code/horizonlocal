<?php

namespace App\Services;

use App\Models\OrderItem;
use App\Models\Vendor;
use Stripe\PaymentIntent;
use Stripe\Stripe;
use Stripe\Transfer;
use Stripe\Refund;
use Stripe\Account;
use Stripe\AccountLink;

class StripeService
{
    public function __construct()
    {
        Stripe::setApiKey(config('services.stripe.secret'));
    }

    /**
     * Create a Stripe PaymentIntent for the cart.
     */
    public function createPaymentIntent(array $cart, float $shippingCost, array $taxes): PaymentIntent
    {
        // TODO: Implement full cart calculation with line items
        $total = $taxes['total'] + $shippingCost;
        $amountInCents = (int) round($total * 100);

        return PaymentIntent::create([
            'amount' => $amountInCents,
            'currency' => 'cad',
            'automatic_payment_methods' => ['enabled' => true],
            'metadata' => [
                'platform' => 'horizonlocal',
            ],
        ]);
    }

    /**
     * Create a Stripe Connect Express account for a vendor.
     */
    public function createConnectAccount(Vendor $vendor): Account
    {
        // TODO: Check if vendor already has a Stripe account
        $account = Account::create([
            'type' => 'express',
            'country' => 'CA',
            'email' => $vendor->user->email,
            'capabilities' => [
                'card_payments' => ['requested' => true],
                'transfers' => ['requested' => true],
            ],
            'business_type' => 'individual',
            'metadata' => [
                'vendor_id' => $vendor->id,
                'store_name' => $vendor->store_name,
            ],
        ]);

        $vendor->update([
            'stripe_account_id' => $account->id,
        ]);

        return $account;
    }

    /**
     * Create an account link for Stripe Connect onboarding.
     */
    public function createAccountLink(Vendor $vendor): AccountLink
    {
        return AccountLink::create([
            'account' => $vendor->stripe_account_id,
            'refresh_url' => config('app.frontend_url') . '/vendor/stripe/refresh',
            'return_url' => config('app.frontend_url') . '/vendor/stripe/complete',
            'type' => 'account_onboarding',
        ]);
    }

    /**
     * Transfer vendor earnings to their Connect account.
     */
    public function transferToVendor(OrderItem $orderItem): Transfer
    {
        $vendor = $orderItem->vendor;

        if (!$vendor || !$vendor->stripe_account_id || !$vendor->stripe_onboarded) {
            throw new \RuntimeException('Vendor Stripe account not ready for transfer.');
        }

        $amountInCents = (int) round($orderItem->vendor_amount * 100);

        return Transfer::create([
            'amount' => $amountInCents,
            'currency' => 'cad',
            'destination' => $vendor->stripe_account_id,
            'metadata' => [
                'order_item_id' => $orderItem->id,
                'order_id' => $orderItem->order_id,
                'vendor_id' => $vendor->id,
            ],
        ]);
    }

    /**
     * Issue a refund for a payment intent.
     */
    public function refund(string $paymentIntentId, ?float $amount = null): Refund
    {
        $params = ['payment_intent' => $paymentIntentId];

        if ($amount !== null) {
            $params['amount'] = (int) round($amount * 100);
        }

        return Refund::create($params);
    }
}
