<?php

namespace App\Http\Controllers\Privacy;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PrivacyController extends Controller
{
    public function myData(): JsonResponse
    {
        $user = auth()->user()->load(['orders.items', 'reviews', 'wishlist']);

        return response()->json([
            'profile' => $user->only('id', 'name', 'email', 'phone', 'created_at'),
            'orders'  => $user->orders,
            'reviews' => $user->reviews,
        ]);
    }

    public function deleteRequest(Request $request): JsonResponse
    {
        // Anonymize user data within 30 days (Loi 25 compliance)
        $user = auth()->user();

        // Log the deletion request
        \App\Models\AuditLog::create([
            'user_id'    => $user->id,
            'action'     => 'delete_request',
            'model_type' => 'User',
            'model_id'   => $user->id,
            'ip_address' => $request->ip(),
        ]);

        return response()->json([
            'message' => 'Votre demande de suppression a été enregistrée. Vos données seront anonymisées dans un délai de 30 jours conformément à la Loi 25.',
        ]);
    }

    public function correction(Request $request): JsonResponse
    {
        $request->validate([
            'name'  => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:20',
        ]);

        auth()->user()->update($request->only('name', 'phone'));

        return response()->json(['message' => 'Vos informations ont été corrigées.']);
    }
}
