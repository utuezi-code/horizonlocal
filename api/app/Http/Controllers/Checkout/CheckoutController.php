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
        $discount = (float) ($cart->discount_amount ?? 0);

        $shipping = $this->shippingCalculator->calculate($cart, $request->province);
        $shippingCost = array_sum(array_column($shipping, 'fee'));

        $taxes = $this->taxService->calculate($subtotal - $discount + $shippingCost, $request->province);

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
                    'discount_amount' => $discount,
                    'shipping_cost' => round($shippingCost, 2),
                    'tax_gst' => $taxes['tps'],
                    'tax_tvq' => $taxes['tvq'],
                    'total' => $taxes['total'] + $shippingCost - $discount,
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors de la création du paiement: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function placeOrder(Request $request): JsonResponse
    {
        $request->validate([
            'payment_intent_id'          => ['required', 'string'],
            'shipping_address'           => ['required', 'array'],
            'shipping_address.name'      => ['required', 'string', 'max:255'],
            'shipping_address.address'   => ['required', 'string', 'max:255'],
            'shipping_address.city'      => ['required', 'string', 'max:100'],
            'shipping_address.province'  => ['required', 'string', 'size:2'],
            'shipping_address.postal_code' => ['required', 'string', 'max:10'],
            'province'                   => ['required', 'string', 'size:2'],
        ]);

        $user = $request->user();
        $cart = $this->cartService->getOrCreate($user->id, null);
        $cart->load('items.product.vendor');

        if ($cart->items()->count() === 0) {
            return response()->json(['message' => 'Le panier est vide.'], 422);
        }

        $addr     = $request->shipping_address;
        $subtotal = $this->cartService->getTotal($cart);
        $discount = (float) ($cart->discount_amount ?? 0);
        $shipping = $this->shippingCalculator->calculate($cart, $request->province);
        $shipCost = array_sum(array_column($shipping, 'fee'));
        $taxes    = $this->taxService->calculate($subtotal - $discount + $shipCost, $request->province);

        $order = \App\Models\Order::create([
            'customer_id'              => $user->id,
            'status'                   => 'pending',
            'subtotal'                 => $subtotal,
            'discount_amount'          => $discount,
            'coupon_code'              => $cart->coupon_code,
            'shipping_cost'            => round($shipCost, 2),
            'tax_gst'                  => $taxes['tps'],
            'tax_tvq'                  => $taxes['tvq'],
            'total'                    => round($taxes['total'] + $shipCost - $discount, 2),
            'stripe_payment_intent_id' => $request->payment_intent_id,
            'shipping_name'            => $addr['name'],
            'shipping_address'         => $addr['address'],
            'shipping_city'            => $addr['city'],
            'shipping_province'        => $addr['province'],
            'shipping_postal_code'     => $addr['postal_code'],
        ]);

        foreach ($cart->items as $item) {
            $unitPrice       = (float) ($item->variant?->price ?? $item->product->price);
            $qty             = (int) $item->quantity;
            $itemSubtotal    = round($unitPrice * $qty, 2);
            $commissionRate  = (float) ($item->product->vendor?->commission_rate ?? 10);
            $commissionAmt   = round($itemSubtotal * $commissionRate / 100, 2);
            $vendorAmt       = round($itemSubtotal - $commissionAmt, 2);

            $order->items()->create([
                'product_id'        => $item->product_id,
                'vendor_id'         => $item->product->vendor_id,
                'variant_id'        => $item->variant_id,
                'product_name'      => $item->product->name,
                'unit_price'        => $unitPrice,
                'quantity'          => $qty,
                'subtotal'          => $itemSubtotal,
                'commission_rate'   => $commissionRate,
                'commission_amount' => $commissionAmt,
                'vendor_amount'     => $vendorAmt,
                'fulfillment_status' => 'pending',
            ]);
        }

        $cart->items()->delete();
        $cart->update(['coupon_code' => null, 'discount_amount' => 0]);

        return response()->json([
            'message' => 'Commande passée avec succès.',
            'order'   => $order->load('items.product'),
        ], 201);
    }
}
