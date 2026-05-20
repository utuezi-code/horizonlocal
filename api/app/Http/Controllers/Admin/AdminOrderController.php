<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderStatusHistory;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminOrderController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $orders = Order::with(['customer', 'items.vendor'])
            ->when($request->status, fn($q, $s) => $q->where('status', $s))
            ->when($request->search, fn($q, $s) => $q->where('id', $s)
                ->orWhereHas('customer', fn($u) => $u->where('name', 'like', "%{$s}%")))
            ->latest()
            ->paginate(20);

        return response()->json($orders);
    }

    public function show(int $id): JsonResponse
    {
        $order = Order::with([
            'customer',
            'items.product.images',
            'items.vendor',
            'items.variant',
            'statusHistory.changedBy',
        ])->findOrFail($id);

        return response()->json($order);
    }

    public function updateStatus(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'status'  => 'required|string',
            'comment' => 'nullable|string|max:500',
        ]);

        $order = Order::findOrFail($id);
        $oldStatus = $order->status;

        $order->update(['status' => $request->status]);

        OrderStatusHistory::create([
            'order_id'   => $order->id,
            'old_status' => $oldStatus,
            'new_status' => $request->status,
            'comment'    => $request->comment,
            'changed_by' => auth()->id(),
            'changed_at' => now(),
        ]);

        return response()->json(['message' => 'Statut de la commande mis à jour.', 'order' => $order]);
    }
}
