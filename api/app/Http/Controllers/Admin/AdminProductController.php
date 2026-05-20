<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Notifications\ProductRejectedNotification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminProductController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $products = Product::with(['vendor', 'category', 'images'])
            ->when($request->status, fn($q, $s) => $q->where('status', $s))
            ->when($request->vendor_id, fn($q, $v) => $q->where('vendor_id', $v))
            ->when($request->search, fn($q, $s) => $q->where('name', 'like', "%{$s}%"))
            ->latest()
            ->paginate(20);

        return response()->json($products);
    }

    public function approve(int $id): JsonResponse
    {
        $product = Product::findOrFail($id);
        $product->update(['status' => 'published']);

        return response()->json(['message' => 'Produit publié avec succès.', 'product' => $product]);
    }

    public function reject(Request $request, int $id): JsonResponse
    {
        $request->validate(['reason' => 'nullable|string|max:500']);

        $product = Product::with('vendor.user')->findOrFail($id);
        $product->update(['status' => 'rejected']);

        if ($product->vendor?->user) {
            $product->vendor->user->notify(
                new ProductRejectedNotification($product, $request->reason)
            );
        }

        return response()->json(['message' => 'Produit refusé.', 'product' => $product]);
    }
}
