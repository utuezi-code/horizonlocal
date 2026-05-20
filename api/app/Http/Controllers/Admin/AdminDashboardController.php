<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Commission;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use App\Models\Vendor;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class AdminDashboardController extends Controller
{
    public function financial(): JsonResponse
    {
        $now = now();
        $startOfMonth = $now->copy()->startOfMonth();
        $startOfYear = $now->copy()->startOfYear();

        $revenueThisMonth = Order::whereIn('status', ['completed', 'delivered'])
            ->where('created_at', '>=', $startOfMonth)
            ->sum('total');

        $revenueThisYear = Order::whereIn('status', ['completed', 'delivered'])
            ->where('created_at', '>=', $startOfYear)
            ->sum('total');

        $commissionsThisMonth = Commission::where('status', 'transferred')
            ->where('created_at', '>=', $startOfMonth)
            ->sum('platform_fee');

        $refundsThisMonth = Order::where('status', 'refunded')
            ->where('created_at', '>=', $startOfMonth)
            ->sum('total');

        $aov = Order::whereIn('status', ['completed', 'delivered'])
            ->where('created_at', '>=', $startOfMonth)
            ->avg('total') ?? 0;

        return response()->json([
            'revenue_this_month'     => round($revenueThisMonth, 2),
            'revenue_this_year'      => round($revenueThisYear, 2),
            'commissions_this_month' => round($commissionsThisMonth, 2),
            'refunds_this_month'     => round($refundsThisMonth, 2),
            'average_order_value'    => round($aov, 2),
            'currency'               => 'CAD',
        ]);
    }

    public function platform(): JsonResponse
    {
        return response()->json([
            'vendors' => [
                'active'    => Vendor::where('status', 'approved')->count(),
                'pending'   => Vendor::where('status', 'pending')->count(),
                'suspended' => Vendor::where('status', 'suspended')->count(),
            ],
            'products' => [
                'published'      => Product::where('status', 'published')->count(),
                'pending_review' => Product::where('status', 'pending_review')->count(),
            ],
            'customers' => [
                'total'      => User::where('role', 'customer')->count(),
                'new_month'  => User::where('role', 'customer')
                    ->where('created_at', '>=', now()->startOfMonth())
                    ->count(),
            ],
        ]);
    }

    public function shipping(): JsonResponse
    {
        $pendingShipment = \App\Models\OrderItem::where('fulfillment_status', 'processing')->count();

        $avgProcessingDays = DB::table('order_items')
            ->whereNotNull('shipped_at')
            ->whereNotNull('created_at')
            ->selectRaw('AVG(EXTRACT(EPOCH FROM (shipped_at - created_at)) / 86400) as avg_days')
            ->value('avg_days');

        return response()->json([
            'pending_shipment'       => $pendingShipment,
            'avg_processing_days'    => round($avgProcessingDays ?? 0, 1),
        ]);
    }
}
