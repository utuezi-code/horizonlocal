<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Vendor;
use App\Notifications\VendorApprovedNotification;
use App\Notifications\VendorRejectedNotification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminVendorController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $vendors = Vendor::with('user')
            ->when($request->status, fn($q, $s) => $q->where('status', $s))
            ->when($request->search, fn($q, $s) => $q->where('store_name', 'like', "%{$s}%"))
            ->latest()
            ->paginate(20);

        return response()->json($vendors);
    }

    public function approve(int $id): JsonResponse
    {
        $vendor = Vendor::findOrFail($id);
        $vendor->update(['status' => 'approved']);
        $vendor->user->notify(new VendorApprovedNotification($vendor));

        return response()->json(['message' => 'Vendeur approuvé avec succès.', 'vendor' => $vendor]);
    }

    public function suspend(int $id): JsonResponse
    {
        $vendor = Vendor::findOrFail($id);
        $vendor->update(['status' => 'suspended']);

        return response()->json(['message' => 'Vendeur suspendu.', 'vendor' => $vendor]);
    }
}
