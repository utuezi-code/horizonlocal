<?php

namespace App\Http\Controllers\Marketer;

use App\Http\Controllers\Controller;
use App\Models\Promotion;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PromotionController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(Promotion::latest()->paginate(20));
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'title'            => 'required|string|max:255',
            'description'      => 'nullable|string',
            'image_url'        => 'nullable|string|max:500',
            'discount_type'    => 'nullable|in:percentage,fixed,free_shipping',
            'discount_value'   => 'nullable|numeric|min:0',
            'code'             => 'nullable|string|max:50|unique:promotions,code',
            'applies_to'       => 'nullable|in:all,category,vendor,product',
            'applies_to_id'    => 'nullable|integer',
            'min_order_amount' => 'nullable|numeric|min:0',
            'max_uses'         => 'nullable|integer|min:1',
            'is_active'        => 'boolean',
            'starts_at'        => 'required|date',
            'ends_at'          => 'nullable|date|after:starts_at',
        ]);
        $data['created_by'] = auth()->id();

        return response()->json(Promotion::create($data), 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $promotion = Promotion::findOrFail($id);
        $data = $request->validate([
            'title'            => 'string|max:255',
            'description'      => 'nullable|string',
            'discount_type'    => 'nullable|in:percentage,fixed,free_shipping',
            'discount_value'   => 'nullable|numeric|min:0',
            'is_active'        => 'boolean',
            'starts_at'        => 'date',
            'ends_at'          => 'nullable|date',
        ]);

        $promotion->update($data);
        return response()->json($promotion);
    }

    public function destroy(int $id): JsonResponse
    {
        Promotion::findOrFail($id)->delete();
        return response()->json(['message' => 'Promotion supprimée.']);
    }
}
