<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $orders = Order::with(['items.product.images', 'items.vendor:id,store_name'])
            ->where('customer_id', $request->user()->id)
            ->orderBy('created_at', 'desc')
            ->paginate($request->get('per_page', 10));

        return response()->json($orders);
    }

    public function show(Request $request, int $id): JsonResponse
    {
        $order = Order::with([
            'items.product.images',
            'items.variant',
            'items.vendor:id,store_name',
            'statusHistory',
        ])
            ->where('customer_id', $request->user()->id)
            ->findOrFail($id);

        return response()->json(['order' => $order]);
    }
}
