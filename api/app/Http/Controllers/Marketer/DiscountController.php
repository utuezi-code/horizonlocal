<?php

namespace App\Http\Controllers\Marketer;

use App\Http\Controllers\Controller;
use App\Models\DiscountRule;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DiscountController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(DiscountRule::latest()->get());
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name'        => 'required|string|max:255',
            'type'        => 'required|in:percentage,fixed',
            'value'       => 'required|numeric|min:0',
            'target_type' => 'required|in:product,category,vendor,all',
            'target_id'   => 'nullable|integer',
            'is_active'   => 'boolean',
            'starts_at'   => 'required|date',
            'ends_at'     => 'nullable|date|after:starts_at',
        ]);
        $data['created_by'] = auth()->id();

        return response()->json(DiscountRule::create($data), 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $rule = DiscountRule::findOrFail($id);
        $rule->update($request->validate([
            'name'      => 'string|max:255',
            'is_active' => 'boolean',
            'ends_at'   => 'nullable|date',
        ]));

        return response()->json($rule);
    }
}
