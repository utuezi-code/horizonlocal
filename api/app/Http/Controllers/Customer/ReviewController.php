<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use App\Models\Review;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'product_id' => ['required', 'exists:products,id'],
            'order_id' => ['required', 'exists:orders,id'],
            'rating' => ['required', 'integer', 'min:1', 'max:5'],
            'comment' => ['nullable', 'string', 'max:2000'],
        ]);

        $user = $request->user();

        // Verify the order belongs to the user and contains the product
        $order = Order::where('id', $request->order_id)
            ->where('customer_id', $user->id)
            ->whereIn('status', ['delivered', 'completed'])
            ->first();

        if (!$order) {
            return response()->json([
                'message' => 'Vous ne pouvez laisser un avis que pour les commandes livrées.',
            ], 403);
        }

        $hasProduct = $order->items()
            ->where('product_id', $request->product_id)
            ->exists();

        if (!$hasProduct) {
            return response()->json([
                'message' => 'Ce produit ne fait pas partie de cette commande.',
            ], 403);
        }

        // Check for existing review
        $existing = Review::where('user_id', $user->id)
            ->where('product_id', $request->product_id)
            ->where('order_id', $request->order_id)
            ->first();

        if ($existing) {
            return response()->json(['message' => 'Vous avez déjà laissé un avis pour ce produit.'], 409);
        }

        $review = Review::create([
            'product_id' => $request->product_id,
            'user_id' => $user->id,
            'order_id' => $request->order_id,
            'rating' => $request->rating,
            'comment' => $request->comment,
            'is_approved' => false,
            'created_at' => now(),
        ]);

        return response()->json(['review' => $review], 201);
    }
}
