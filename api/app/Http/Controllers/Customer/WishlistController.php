<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Wishlist;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class WishlistController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $items = Wishlist::with(['product.images', 'product.vendor:id,store_name,store_slug'])
            ->where('user_id', $request->user()->id)
            ->orderBy('added_at', 'desc')
            ->get();

        // Return a flat array of products the frontend can use directly.
        $products = $items->map(fn ($w) => $w->product)->filter()->values();

        return response()->json($products);
    }

    public function store(Request $request, int $productId): JsonResponse
    {
        Product::findOrFail($productId);

        $existing = Wishlist::where('user_id', $request->user()->id)
            ->where('product_id', $productId)
            ->first();

        if ($existing) {
            return response()->json(['message' => 'Ce produit est déjà dans votre liste de souhaits.'], 409);
        }

        $wishlist = Wishlist::create([
            'user_id'    => $request->user()->id,
            'product_id' => $productId,
            'added_at'   => now(),
        ]);

        return response()->json(['wishlist' => $wishlist->load('product')], 201);
    }

    public function destroy(Request $request, int $productId): JsonResponse
    {
        $wishlist = Wishlist::where('user_id', $request->user()->id)
            ->where('product_id', $productId)
            ->firstOrFail();

        $wishlist->delete();

        return response()->json(['message' => 'Produit retiré de la liste de souhaits.']);
    }
}
