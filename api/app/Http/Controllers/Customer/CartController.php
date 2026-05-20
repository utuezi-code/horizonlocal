<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\Cart;
use App\Models\CartItem;
use App\Services\CartService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CartController extends Controller
{
    public function __construct(private readonly CartService $cartService)
    {
    }

    private function getCart(Request $request): Cart
    {
        $userId    = $request->user()?->id;
        $sessionId = $request->header('X-Session-Id') ?? $request->get('session_id');

        return $this->cartService->getOrCreate($userId, $sessionId);
    }

    /**
     * Return a fully-loaded cart object the frontend can use directly.
     * Shape: { id, items: [{id, product_id, quantity, product, variant}], total, coupon_code, discount_amount }
     */
    private function cartResponse(Request $request): JsonResponse
    {
        $cart  = $this->getCart($request);
        $cart->load(['items.product.images', 'items.product.vendor:id,store_name', 'items.variant']);
        $total = $this->cartService->getTotal($cart);

        $data          = $cart->toArray();
        $data['total'] = $total;

        return response()->json($data);
    }

    public function show(Request $request): JsonResponse
    {
        return $this->cartResponse($request);
    }

    public function addItem(Request $request): JsonResponse
    {
        $request->validate([
            'product_id' => ['required', 'exists:products,id'],
            'variant_id' => ['nullable', 'exists:product_variants,id'],
            'quantity'   => ['required', 'integer', 'min:1'],
        ]);

        $cart = $this->getCart($request);

        try {
            $this->cartService->addItem(
                $cart,
                $request->product_id,
                $request->variant_id,
                $request->quantity
            );
        } catch (\RuntimeException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }

        return $this->cartResponse($request);
    }

    public function updateItem(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'quantity' => ['required', 'integer', 'min:0'],
        ]);

        $cart     = $this->getCart($request);
        $cartItem = CartItem::where('id', $id)->where('cart_id', $cart->id)->firstOrFail();

        $this->cartService->updateItem($cartItem, $request->quantity);

        return $this->cartResponse($request);
    }

    public function removeItem(Request $request, int $id): JsonResponse
    {
        $cart     = $this->getCart($request);
        $cartItem = CartItem::where('id', $id)->where('cart_id', $cart->id)->firstOrFail();

        $cartItem->delete();

        return $this->cartResponse($request);
    }

    public function clear(Request $request): JsonResponse
    {
        $cart = $this->getCart($request);
        $cart->items()->delete();

        return $this->cartResponse($request);
    }

    public function applyCoupon(Request $request): JsonResponse
    {
        $request->validate([
            'code' => ['required', 'string', 'max:50'],
        ]);

        $coupon = \App\Models\DiscountRule::where('code', strtoupper($request->code))
            ->where('is_active', true)
            ->where(function ($q) {
                $q->whereNull('expires_at')->orWhere('expires_at', '>', now());
            })
            ->first();

        if (!$coupon) {
            return response()->json(['message' => 'Code promo invalide ou expiré.'], 422);
        }

        $cart = $this->getCart($request);
        $cart->update([
            'coupon_code'     => strtoupper($request->code),
            'discount_amount' => $this->cartService->calculateDiscount($cart, $coupon),
        ]);

        return $this->cartResponse($request);
    }

    public function removeCoupon(Request $request): JsonResponse
    {
        $cart = $this->getCart($request);
        $cart->update(['coupon_code' => null, 'discount_amount' => 0]);

        return $this->cartResponse($request);
    }
}
