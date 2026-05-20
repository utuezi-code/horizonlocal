<?php

namespace App\Http\Controllers\Vendor;

use App\Http\Controllers\Controller;
use App\Models\Commission;
use App\Models\OrderItem;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class VendorEarningsController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $vendor = $request->user()->vendor;

        if (!$vendor) {
            abort(403, 'Vous n\'avez pas de boutique associée.');
        }

        $period = $request->get('period', 'month');
        $year = $request->get('year', now()->year);
        $month = $request->get('month', now()->month);

        $commissionsQuery = Commission::where('vendor_id', $vendor->id);

        if ($period === 'month') {
            $commissionsQuery->whereYear('created_at', $year)
                ->whereMonth('created_at', $month);
        } elseif ($period === 'year') {
            $commissionsQuery->whereYear('created_at', $year);
        }

        $commissions = $commissionsQuery->get();

        $summary = [
            'total_commissions' => $commissions->count(),
            'total_vendor_earnings' => $commissions->sum(fn ($c) => (float) $c->amount),
            'transferred_earnings' => $commissions->where('status', 'transferred')->sum(fn ($c) => (float) $c->amount),
            'pending_earnings' => $commissions->where('status', 'pending')->sum(fn ($c) => (float) $c->amount),
            'failed_transfers' => $commissions->where('status', 'failed')->count(),
            'period' => $period,
            'year' => $year,
            'month' => $month,
        ];

        $recentCommissions = Commission::where('vendor_id', $vendor->id)
            ->with('orderItem.order')
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return response()->json([
            'summary' => $summary,
            'commissions' => $recentCommissions,
        ]);
    }
}
