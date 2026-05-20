<?php

namespace App\Http\Controllers\Marketer;

use App\Http\Controllers\Controller;
use App\Models\BlogPost;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class BlogController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(BlogPost::with('author')->latest()->paginate(20));
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'title'           => 'required|string|max:255',
            'excerpt'         => 'nullable|string',
            'content'         => 'required|string',
            'cover_image_url' => 'nullable|string|max:500',
            'category'        => 'nullable|string|max:100',
            'status'          => 'in:draft,published',
            'published_at'    => 'nullable|date',
        ]);

        $data['slug']      = Str::slug($data['title']) . '-' . time();
        $data['author_id'] = auth()->id();

        if (($data['status'] ?? 'draft') === 'published' && empty($data['published_at'])) {
            $data['published_at'] = now();
        }

        return response()->json(BlogPost::create($data), 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $post = BlogPost::findOrFail($id);
        $data = $request->validate([
            'title'           => 'string|max:255',
            'excerpt'         => 'nullable|string',
            'content'         => 'string',
            'cover_image_url' => 'nullable|string|max:500',
            'category'        => 'nullable|string|max:100',
            'status'          => 'in:draft,published',
            'published_at'    => 'nullable|date',
        ]);

        if (isset($data['status']) && $data['status'] === 'published' && !$post->published_at) {
            $data['published_at'] = now();
        }

        $post->update($data);
        return response()->json($post);
    }

    public function destroy(int $id): JsonResponse
    {
        BlogPost::findOrFail($id)->delete();
        return response()->json(['message' => 'Article supprimé.']);
    }
}
