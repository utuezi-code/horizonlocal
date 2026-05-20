<?php

namespace App\Http\Controllers\Vendor;

use App\Http\Controllers\Controller;
use App\Models\Commission;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class VendorDashboardController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $vendor = $request->user()->vendor;

        if (!$vendor) {
            abort(403, 'Vous n\'avez pas de boutique associée.');
        }

        $period = $request->get('period', 'month');
        $year = now()->year;
        $month = now()->month;

        $itemsQuery = OrderItem::where('vendor_id', $vendor->id);

        if ($period === 'month') {
            $itemsQuery->whereYear('created_at', $year)->whereMonth('created_at', $month);
        } elseif ($period === 'year') {
            $itemsQuery->whereYear('created_at', $year);
        }

        $items = $itemsQuery->get();

        $pendingOrdersCount = OrderItem::where('vendor_id', $vendor->id)
            ->whereIn('fulfillment_status', ['pending', 'processing'])
            ->count();

        $productsCount = Product::where('vendor_id', $vendor->id)->count();

        $totalRevenue = $items->sum(fn ($item) => (float) $item->vendor_amount);

        $totalOrders = OrderItem::where('vendor_id', $vendor->id)
            ->distinct('order_id')
            ->count('order_id');

        return response()->json([
            'stats' => [
                'total_orders' => $totalOrders,
                'period_revenue' => round($totalRevenue, 2),
                'pending_orders' => $pendingOrdersCount,
                'products_count' => $productsCount,
                'period' => $period,
            ],
        ]);
    }
}
