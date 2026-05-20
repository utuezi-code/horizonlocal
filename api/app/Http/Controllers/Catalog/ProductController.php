<?php

namespace App\Http\Controllers\Catalog;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Product::with(['vendor:id,store_name,store_slug', 'category:id,name,slug', 'images'])
            ->published();

        if ($request->filled('category')) {
            $query->where('category_id', $request->category);
        }

        if ($request->filled('vendor')) {
            $query->where('vendor_id', $request->vendor);
        }

        if ($request->filled('min_price')) {
            $query->where('price', '>=', $request->min_price);
        }

        if ($request->filled('max_price')) {
            $query->where('price', '<=', $request->max_price);
        }

        if ($request->filled('featured')) {
            $query->featured();
        }

        $sortBy = $request->get('sort_by', 'created_at');
        $sortDir = $request->get('sort_dir', 'desc');

        $allowedSorts = ['price', 'name', 'created_at'];
        if (!in_array($sortBy, $allowedSorts)) {
            $sortBy = 'created_at';
        }

        $query->orderBy($sortBy, $sortDir === 'asc' ? 'asc' : 'desc');

        $products = $query->paginate($request->get('per_page', 20));

        return response()->json($products);
    }

    public function show(string $slug): JsonResponse
    {
        $product = Product::with([
            'vendor:id,store_name,store_slug,city,province',
            'category:id,name,slug',
            'images',
            'variants.attributeValues.attributeType',
        ])
            ->published()
            ->where('slug', $slug)
            ->firstOrFail();

        return response()->json(['product' => $product]);
    }

    public function featured(): JsonResponse
    {
        $products = Product::with(['vendor:id,store_name,store_slug', 'images'])
            ->published()
            ->featured()
            ->orderBy('created_at', 'desc')
            ->limit(12)
            ->get();

        return response()->json(['products' => $products]);
    }
}
