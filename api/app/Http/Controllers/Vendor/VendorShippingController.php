<?php

namespace App\Http\Controllers\Vendor;

use App\Http\Controllers\Controller;
use App\Models\VendorShippingZone;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class VendorShippingController extends Controller
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

        $zones = VendorShippingZone::where('vendor_id', $vendor->id)->get();

        return response()->json(['shipping_zones' => $zones]);
    }

    public function store(Request $request): JsonResponse
    {
        $vendor = $this->getVendor($request);

        $data = $request->validate([
            'zone_name' => ['required', 'string', 'max:100'],
            'provinces' => ['nullable', 'array'],
            'provinces.*' => ['string', 'size:2'],
            'base_fee' => ['nullable', 'numeric', 'min:0'],
            'free_above' => ['nullable', 'numeric', 'min:0'],
            'per_kg_fee' => ['nullable', 'numeric', 'min:0'],
            'estimated_days_min' => ['nullable', 'integer', 'min:1'],
            'estimated_days_max' => ['nullable', 'integer', 'min:1'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        $zone = VendorShippingZone::create(array_merge($data, ['vendor_id' => $vendor->id]));

        return response()->json(['shipping_zone' => $zone], 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $vendor = $this->getVendor($request);
        $zone = VendorShippingZone::where('id', $id)->where('vendor_id', $vendor->id)->firstOrFail();

        $data = $request->validate([
            'zone_name' => ['nullable', 'string', 'max:100'],
            'provinces' => ['nullable', 'array'],
            'provinces.*' => ['string', 'size:2'],
            'base_fee' => ['nullable', 'numeric', 'min:0'],
            'free_above' => ['nullable', 'numeric', 'min:0'],
            'per_kg_fee' => ['nullable', 'numeric', 'min:0'],
            'estimated_days_min' => ['nullable', 'integer', 'min:1'],
            'estimated_days_max' => ['nullable', 'integer', 'min:1'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        $zone->update($data);

        return response()->json(['shipping_zone' => $zone]);
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $vendor = $this->getVendor($request);
        $zone = VendorShippingZone::where('id', $id)->where('vendor_id', $vendor->id)->firstOrFail();

        $zone->delete();

        return response()->json(['message' => 'Zone d\'expédition supprimée avec succès.']);
    }
}
