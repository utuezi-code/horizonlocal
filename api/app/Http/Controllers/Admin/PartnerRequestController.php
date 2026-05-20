<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\PartnerRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PartnerRequestController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $requests = PartnerRequest::with('vendor')
            ->when($request->status, fn($q, $s) => $q->where('status', $s))
            ->latest()
            ->paginate(20);

        return response()->json($requests);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'status'         => 'required|in:in_review,resolved,rejected',
            'admin_response' => 'nullable|string|max:1000',
        ]);

        $partnerRequest = PartnerRequest::findOrFail($id);
        $partnerRequest->update([
            'status'        => $request->status,
            'admin_response' => $request->admin_response,
            'responded_by'   => auth()->id(),
            'responded_at'   => now(),
        ]);

        return response()->json(['message' => 'Demande mise à jour.', 'request' => $partnerRequest]);
    }
}
