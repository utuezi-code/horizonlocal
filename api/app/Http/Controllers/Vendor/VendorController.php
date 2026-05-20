<?php

namespace App\Http\Controllers\Vendor;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Vendor;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class VendorController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $vendors = Vendor::approved()
            ->with('user:id,name')
            ->withCount('products')
            ->paginate($request->get('per_page', 20));

        return response()->json($vendors);
    }

    public function show(string $slug, Request $request): JsonResponse
    {
        $vendor = Vendor::approved()
            ->where('store_slug', $slug)
            ->firstOrFail();

        $products = Product::with(['images', 'category:id,name,slug'])
            ->published()
            ->where('vendor_id', $vendor->id)
            ->paginate($request->get('per_page', 20));

        return response()->json([
            'vendor' => $vendor,
            'products' => $products,
        ]);
    }
}
