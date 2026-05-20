<?php

namespace App\Http\Controllers\Catalog;

use App\Http\Controllers\Controller;
use App\Models\BlogPost;
use Illuminate\Http\JsonResponse;

class BlogPostController extends Controller
{
    public function show(string $slug): JsonResponse
    {
        $post = BlogPost::where('slug', $slug)
            ->where('status', 'published')
            ->with('author:id,name')
            ->firstOrFail();

        return response()->json($post);
    }
}
