<?php

namespace App\Services;

use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Product;

class CartService
{
    /**
     * Get an existing cart or create a new one.
     */
    public function getOrCreate(?int $userId, ?string $sessionId): Cart
    {
        if ($userId) {
            return Cart::firstOrCreate(['user_id' => $userId]);
        }

        return Cart::firstOrCreate(['session_id' => $sessionId]);
    }

    /**
     * Add or update an item in the cart.
     */
    public function addItem(Cart $cart, int $productId, ?int $variantId, int $quantity): CartItem
    {
        $product = Product::findOrFail($productId);

        if ($product->manage_stock && $product->stock < $quantity) {
            throw new \RuntimeException('Stock insuffisant pour ce produit.');
        }

        $existingItem = CartItem::where('cart_id', $cart->id)
            ->where('product_id', $productId)
            ->where('variant_id', $variantId)
            ->first();

        if ($existingItem) {
            $newQty = $existingItem->quantity + $quantity;

            if ($product->manage_stock && $product->stock < $newQty) {
                throw new \RuntimeException('Stock insuffisant pour ce produit.');
            }

            $existingItem->update(['quantity' => $newQty]);
            return $existingItem;
        }

        return CartItem::create([
            'cart_id' => $cart->id,
            'product_id' => $productId,
            'variant_id' => $variantId,
            'quantity' => $quantity,
            'added_at' => now(),
        ]);
    }

    /**
     * Update the quantity of a cart item. Removes item if quantity is 0.
     */
    public function updateItem(CartItem $cartItem, int $quantity): ?CartItem
    {
        if ($quantity <= 0) {
            $cartItem->delete();
            return null;
        }

        $cartItem->update(['quantity' => $quantity]);
        return $cartItem;
    }

    /**
     * Get the total price of the cart.
     */
    public function getTotal(Cart $cart): float
    {
        $total = 0.0;

        foreach ($cart->items()->with(['product', 'variant'])->get() as $item) {
            $price = $item->variant?->price ?? $item->product->price;
            $total += (float) $price * $item->quantity;
        }

        return round($total, 2);
    }

    /**
     * Merge a guest cart into a user cart on login.
     */
    public function merge(Cart $guestCart, Cart $userCart): void
    {
        foreach ($guestCart->items as $guestItem) {
            $existingItem = CartItem::where('cart_id', $userCart->id)
                ->where('product_id', $guestItem->product_id)
                ->where('variant_id', $guestItem->variant_id)
                ->first();

            if ($existingItem) {
                $existingItem->increment('quantity', $guestItem->quantity);
            } else {
                CartItem::create([
                    'cart_id' => $userCart->id,
                    'product_id' => $guestItem->product_id,
                    'variant_id' => $guestItem->variant_id,
                    'quantity' => $guestItem->quantity,
                    'added_at' => now(),
                ]);
            }
        }

        $guestCart->items()->delete();
        $guestCart->delete();
    }
}
