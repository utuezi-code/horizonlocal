<?php

namespace App\Http\Controllers\Catalog;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Product;
use App\Models\Vendor;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SearchController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $request->validate([
            'q' => ['required', 'string', 'min:2', 'max:255'],
        ]);

        $q = $request->q;

        $products = Product::with(['vendor:id,store_name,store_slug', 'category:id,name,slug'])
            ->published()
            ->where(function ($query) use ($q) {
                $query->whereRaw('LOWER(name) LIKE ?', ['%' . strtolower($q) . '%'])
                      ->orWhereRaw('LOWER(description) LIKE ?', ['%' . strtolower($q) . '%'])
                      ->orWhereRaw('LOWER(sku) LIKE ?', ['%' . strtolower($q) . '%']);
            })
            ->orderBy('created_at', 'desc')
            ->paginate($request->get('per_page', 20));

        return response()->json($products);
    }

    public function suggestions(Request $request): JsonResponse
    {
        $request->validate([
            'q' => ['required', 'string', 'min:2', 'max:100'],
        ]);

        $q = strtolower($request->q);

        $products = Product::with(['vendor:id,store_name,store_slug'])
            ->published()
            ->whereRaw('LOWER(name) LIKE ?', ['%' . $q . '%'])
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get(['id', 'name', 'slug', 'price', 'vendor_id']);

        $categories = Category::whereRaw('LOWER(name) LIKE ?', ['%' . $q . '%'])
            ->limit(3)
            ->get(['id', 'name', 'slug']);

        $vendors = Vendor::whereRaw('LOWER(store_name) LIKE ?', ['%' . $q . '%'])
            ->where('status', 'approved')
            ->limit(3)
            ->get(['id', 'store_name', 'store_slug', 'city']);

        return response()->json([
            'products'   => $products,
            'categories' => $categories,
            'vendors'    => $vendors,
        ]);
    }
}
