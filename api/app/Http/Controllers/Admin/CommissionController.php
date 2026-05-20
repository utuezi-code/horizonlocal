<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Jobs\ProcessStripeTransfer;
use App\Models\Commission;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CommissionController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $commissions = Commission::with(['vendor', 'orderItem.order'])
            ->when($request->status, fn($q, $s) => $q->where('status', $s))
            ->when($request->vendor_id, fn($q, $v) => $q->where('vendor_id', $v))
            ->latest()
            ->paginate(20);

        $summary = [
            'total_pending'    => Commission::where('status', 'pending')->sum('amount'),
            'total_transferred' => Commission::where('status', 'transferred')->sum('amount'),
            'total_failed'     => Commission::where('status', 'failed')->count(),
        ];

        return response()->json(['data' => $commissions, 'summary' => $summary]);
    }

    public function retry(int $id): JsonResponse
    {
        $commission = Commission::with('orderItem')->findOrFail($id);

        if ($commission->status !== 'failed') {
            return response()->json(['message' => 'Seules les commissions échouées peuvent être relancées.'], 422);
        }

        $commission->update(['status' => 'pending']);
        ProcessStripeTransfer::dispatch($commission->orderItem);

        return response()->json(['message' => 'Transfert relancé.']);
    }
}
