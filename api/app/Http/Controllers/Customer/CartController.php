<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\CartItem;
use App\Services\CartService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CartController extends Controller
{
    public function __construct(private readonly CartService $cartService)
    {
    }

    private function getCart(Request $request)
    {
        $userId = $request->user()?->id;
        $sessionId = $request->header('X-Session-Id') ?? $request->get('session_id');

        return $this->cartService->getOrCreate($userId, $sessionId);
    }

    public function show(Request $request): JsonResponse
    {
        $cart = $this->getCart($request);

        $cart->load(['items.product.images', 'items.variant']);

        $total = $this->cartService->getTotal($cart);

        return response()->json([
            'cart' => $cart,
            'total' => $total,
        ]);
    }

    public function addItem(Request $request): JsonResponse
    {
        $request->validate([
            'product_id' => ['required', 'exists:products,id'],
            'variant_id' => ['nullable', 'exists:product_variants,id'],
            'quantity' => ['required', 'integer', 'min:1'],
        ]);

        $cart = $this->getCart($request);

        try {
            $item = $this->cartService->addItem(
                $cart,
                $request->product_id,
                $request->variant_id,
                $request->quantity
            );

            return response()->json(['cart_item' => $item->load(['product', 'variant'])], 201);
        } catch (\RuntimeException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }

    public function updateItem(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'quantity' => ['required', 'integer', 'min:0'],
        ]);

        $cart = $this->getCart($request);
        $cartItem = CartItem::where('id', $id)->where('cart_id', $cart->id)->firstOrFail();

        $item = $this->cartService->updateItem($cartItem, $request->quantity);

        if ($item === null) {
            return response()->json(['message' => 'Article supprimé du panier.']);
        }

        return response()->json(['cart_item' => $item]);
    }

    public function removeItem(Request $request, int $id): JsonResponse
    {
        $cart = $this->getCart($request);
        $cartItem = CartItem::where('id', $id)->where('cart_id', $cart->id)->firstOrFail();

        $cartItem->delete();

        return response()->json(['message' => 'Article supprimé du panier.']);
    }

    public function clear(Request $request): JsonResponse
    {
        $cart = $this->getCart($request);
        $cart->items()->delete();

        return response()->json(['message' => 'Panier vidé avec succès.']);
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

        return response()->json([
            'message'         => 'Code promo appliqué.',
            'coupon_code'     => $cart->coupon_code,
            'discount_amount' => $cart->discount_amount,
        ]);
    }

    public function removeCoupon(Request $request): JsonResponse
    {
        $cart = $this->getCart($request);
        $cart->update(['coupon_code' => null, 'discount_amount' => 0]);

        return response()->json(['message' => 'Code promo retiré.']);
    }
}
