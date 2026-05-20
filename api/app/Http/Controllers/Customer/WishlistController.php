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
        $wishlist = Wishlist::with(['product.images', 'product.vendor:id,store_name,store_slug'])
            ->where('user_id', $request->user()->id)
            ->orderBy('added_at', 'desc')
            ->paginate($request->get('per_page', 20));

        return response()->json($wishlist);
    }

    public function store(Request $request, int $productId): JsonResponse
    {
        $product = Product::findOrFail($productId);

        $existing = Wishlist::where('user_id', $request->user()->id)
            ->where('product_id', $productId)
            ->first();

        if ($existing) {
            return response()->json(['message' => 'Ce produit est déjà dans votre liste de souhaits.'], 409);
        }

        $wishlist = Wishlist::create([
            'user_id' => $request->user()->id,
            'product_id' => $productId,
            'added_at' => now(),
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
