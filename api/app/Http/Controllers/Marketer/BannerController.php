<?php

namespace App\Http\Controllers\Marketer;

use App\Http\Controllers\Controller;
use App\Models\Banner;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BannerController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(Banner::orderBy('sort_order')->get());
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'location'          => 'required|in:homepage_hero,homepage_secondary,category,promotions_page,sidebar',
            'title'             => 'nullable|string|max:255',
            'subtitle'          => 'nullable|string',
            'cta_text'          => 'nullable|string|max:100',
            'cta_url'           => 'nullable|string|max:500',
            'image_desktop_url' => 'nullable|string|max:500',
            'image_mobile_url'  => 'nullable|string|max:500',
            'bg_color'          => 'nullable|string|size:7',
            'text_color'        => 'nullable|string|size:7',
            'is_active'         => 'boolean',
            'sort_order'        => 'integer',
            'valid_from'        => 'nullable|date',
            'valid_until'       => 'nullable|date',
        ]);

        $data['created_by'] = auth()->id();
        $data['updated_by'] = auth()->id();

        return response()->json(Banner::create($data), 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $banner = Banner::findOrFail($id);
        $data = $request->validate([
            'title'             => 'nullable|string|max:255',
            'subtitle'          => 'nullable|string',
            'cta_text'          => 'nullable|string|max:100',
            'cta_url'           => 'nullable|string|max:500',
            'image_desktop_url' => 'nullable|string|max:500',
            'image_mobile_url'  => 'nullable|string|max:500',
            'bg_color'          => 'nullable|string|size:7',
            'text_color'        => 'nullable|string|size:7',
            'is_active'         => 'boolean',
            'sort_order'        => 'integer',
            'valid_from'        => 'nullable|date',
            'valid_until'       => 'nullable|date',
        ]);
        $data['updated_by'] = auth()->id();

        $banner->update($data);
        return response()->json($banner);
    }

    public function destroy(int $id): JsonResponse
    {
        Banner::findOrFail($id)->delete();
        return response()->json(['message' => 'Bannière supprimée.']);
    }
}
