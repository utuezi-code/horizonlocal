<?php

namespace App\Http\Controllers\Vendor;

use App\Http\Controllers\Controller;
use App\Http\Requests\Vendor\UpdateFulfillmentRequest;
use App\Models\Order;
use App\Models\OrderItem;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class VendorOrderController extends Controller
{
    private function getVendor(Request $request)
    {
        $vendor = $request->user()->vendor;

        if (!$vendor) {
            abort(403, 'Vous n\'avez pas de boutique associée.');
        }

        return $vendor;
    }

    public function index(Request $request): JsonResponse
    {
        $vendor = $this->getVendor($request);

        $orderIds = OrderItem::where('vendor_id', $vendor->id)
            ->distinct()
            ->pluck('order_id');

        $orders = Order::with([
            'items' => fn ($q) => $q->where('vendor_id', $vendor->id)->with('product:id,name'),
            'customer:id,name,email',
        ])
            ->whereIn('id', $orderIds)
            ->orderBy('created_at', 'desc')
            ->paginate($request->get('per_page', 20));

        return response()->json($orders);
    }

    public function show(Request $request, int $id): JsonResponse
    {
        $vendor = $this->getVendor($request);

        $order = Order::with([
            'items' => fn ($q) => $q->where('vendor_id', $vendor->id)->with(['product', 'variant']),
            'customer:id,name,email',
        ])
            ->whereHas('items', fn ($q) => $q->where('vendor_id', $vendor->id))
            ->findOrFail($id);

        return response()->json(['order' => $order]);
    }

    public function updateFulfillment(UpdateFulfillmentRequest $request, int $id): JsonResponse
    {
        $vendor = $this->getVendor($request);

        $orderItem = OrderItem::where('id', $id)
            ->where('vendor_id', $vendor->id)
            ->firstOrFail();

        $data = $request->validated();

        if ($data['fulfillment_status'] === 'shipped') {
            $data['shipped_at'] = now();
        } elseif ($data['fulfillment_status'] === 'delivered') {
            $data['delivered_at'] = now();
        }

        $orderItem->update($data);

        return response()->json(['order_item' => $orderItem]);
    }

    public function updateTracking(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'tracking_number' => ['required', 'string', 'max:100'],
            'carrier'         => ['required', 'string', 'in:canadapost,purolator,fedex,ups,autre'],
        ]);

        $vendor = $this->getVendor($request);

        $order = \App\Models\Order::whereHas('items', fn($q) => $q->where('vendor_id', $vendor->id))
            ->findOrFail($id);

        $order->update([
            'tracking_number' => $request->tracking_number,
            'carrier'         => $request->carrier,
            'status'          => 'shipped',
        ]);

        $order->statusHistory()->create([
            'status'     => 'shipped',
            'note'       => "Expédié via {$request->carrier} — n° {$request->tracking_number}",
            'changed_by' => $request->user()->id,
        ]);

        return response()->json(['message' => 'Suivi mis à jour.', 'order' => $order]);
    }
}
