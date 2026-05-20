<?php

namespace App\Http\Controllers\Marketer;

use App\Http\Controllers\Controller;
use App\Models\ContentBlock;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ContentBlockController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(ContentBlock::all()->keyBy('key'));
    }

    public function update(Request $request, string $key): JsonResponse
    {
        $request->validate(['value' => 'required|string']);

        $block = ContentBlock::where('key', $key)->firstOrFail();
        $block->update([
            'value'      => $request->value,
            'updated_by' => auth()->id(),
            'updated_at' => now(),
        ]);

        return response()->json($block);
    }
}
