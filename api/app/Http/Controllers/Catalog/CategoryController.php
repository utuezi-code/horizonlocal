<?php

namespace App\Http\Controllers\Catalog;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    public function index(): JsonResponse
    {
        $categories = Category::with('children')
            ->whereNull('parent_id')
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->get();

        return response()->json(['categories' => $categories]);
    }

    public function show(string $slug, Request $request): JsonResponse
    {
        $category = Category::where('slug', $slug)
            ->where('is_active', true)
            ->firstOrFail();

        $products = Product::with(['vendor:id,store_name,store_slug', 'images'])
            ->published()
            ->where('category_id', $category->id)
            ->paginate($request->get('per_page', 20));

        return response()->json([
            'category' => $category->load('children'),
            'products' => $products,
        ]);
    }
}
