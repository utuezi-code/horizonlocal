<?php

namespace App\Http\Controllers\Checkout;

use App\Http\Controllers\Controller;
use App\Services\CartService;
use App\Services\ShippingCalculator;
use App\Services\StripeService;
use App\Services\TaxService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CheckoutController extends Controller
{
    public function __construct(
        private readonly CartService $cartService,
        private readonly ShippingCalculator $shippingCalculator,
        private readonly TaxService $taxService,
        private readonly StripeService $stripeService
    ) {
    }

    public function calculateShipping(Request $request): JsonResponse
    {
        $request->validate([
            'province' => ['required', 'string', 'size:2'],
        ]);

        $userId = $request->user()->id;
        $cart = $this->cartService->getOrCreate($userId, null);

        if ($cart->items()->count() === 0) {
            return response()->json(['message' => 'Le panier est vide.'], 422);
        }

        $shipping = $this->shippingCalculator->calculate($cart, $request->province);

        $totalShipping = array_sum(array_column($shipping, 'fee'));

        return response()->json([
            'shipping_by_vendor' => $shipping,
            'total_shipping' => round($totalShipping, 2),
        ]);
    }

    public function calculateTaxes(Request $request): JsonResponse
    {
        $request->validate([
            'province' => ['required', 'string', 'size:2'],
            'subtotal' => ['required', 'numeric', 'min:0'],
            'shipping_cost' => ['nullable', 'numeric', 'min:0'],
        ]);

        $subtotal = $request->subtotal;
        $shippingCost = $request->get('shipping_cost', 0);
        $taxableAmount = $subtotal + $shippingCost;

        $taxes = $this->taxService->calculate($taxableAmount, $request->province);

        return response()->json([
            'subtotal' => $subtotal,
            'shipping_cost' => $shippingCost,
            'taxable_amount' => $taxableAmount,
            'tax_gst' => $taxes['tps'],
            'tax_tvq' => $taxes['tvq'],
            'total' => $taxes['total'],
        ]);
    }

    public function createPaymentIntent(Request $request): JsonResponse
    {
        $request->validate([
            'province' => ['required', 'string', 'size:2'],
        ]);

        $userId = $request->user()->id;
        $cart = $this->cartService->getOrCreate($userId, null);

        if ($cart->items()->count() === 0) {
            return response()->json(['message' => 'Le panier est vide.'], 422);
        }

        $cart->load('items.product');

        $subtotal = $this->cartService->getTotal($cart);

        $shipping = $this->shippingCalculator->calculate($cart, $request->province);
        $shippingCost = array_sum(array_column($shipping, 'fee'));

        $taxes = $this->taxService->calculate($subtotal + $shippingCost, $request->province);

        try {
            $paymentIntent = $this->stripeService->createPaymentIntent(
                $cart->toArray(),
                $shippingCost,
                $taxes
            );

            return response()->json([
                'client_secret' => $paymentIntent->client_secret,
                'payment_intent_id' => $paymentIntent->id,
                'amount' => $paymentIntent->amount,
                'currency' => $paymentIntent->currency,
                'breakdown' => [
                    'subtotal' => $subtotal,
                    'shipping_cost' => round($shippingCost, 2),
                    'tax_gst' => $taxes['tps'],
                    'tax_tvq' => $taxes['tvq'],
                    'total' => $taxes['total'] + $shippingCost,
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors de la création du paiement: ' . $e->getMessage(),
            ], 500);
        }
    }
}
