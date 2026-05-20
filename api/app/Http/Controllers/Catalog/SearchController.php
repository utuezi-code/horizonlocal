<?php

namespace App\Http\Controllers\Catalog;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SearchController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $request->validate([
            'q' => ['required', 'string', 'min:2', 'max:255'],
        ]);

        $results = Product::search($request->q)
            ->where('status', 'published')
            ->paginate($request->get('per_page', 20));

        return response()->json($results);
    }
}
