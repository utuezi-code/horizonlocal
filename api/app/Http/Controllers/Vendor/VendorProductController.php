<?php

namespace App\Http\Controllers\Vendor;

use App\Http\Controllers\Controller;
use App\Http\Requests\Vendor\StoreProductRequest;
use App\Models\AttributeType;
use App\Models\AttributeValue;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Notifications\NewProductPendingNotification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Str;

class VendorProductController extends Controller
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

        $products = Product::with(['category:id,name', 'images'])
            ->where('vendor_id', $vendor->id)
            ->paginate($request->get('per_page', 20));

        return response()->json($products);
    }

    public function store(StoreProductRequest $request): JsonResponse
    {
        $vendor = $this->getVendor($request);

        $slug = Str::slug($request->name) . '-' . Str::random(6);

        $product = Product::create(array_merge($request->validated(), [
            'vendor_id' => $vendor->id,
            'slug' => $slug,
            'status' => 'draft',
        ]));

        // Handle images if provided
        if ($request->filled('images')) {
            foreach ($request->images as $index => $imageUrl) {
                $product->images()->create([
                    'url' => $imageUrl,
                    'is_primary' => $index === 0,
                    'sort_order' => $index,
                ]);
            }
        }

        return response()->json(['product' => $product->load('images')], 201);
    }

    public function update(StoreProductRequest $request, int $id): JsonResponse
    {
        $vendor = $this->getVendor($request);

        $product = Product::where('id', $id)
            ->where('vendor_id', $vendor->id)
            ->firstOrFail();

        $product->update($request->validated());

        return response()->json(['product' => $product->load(['images', 'category'])]);
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $vendor = $this->getVendor($request);

        $product = Product::where('id', $id)
            ->where('vendor_id', $vendor->id)
            ->firstOrFail();

        $product->delete();

        return response()->json(['message' => 'Produit supprimé avec succès.']);
    }

    public function submit(Request $request, int $id): JsonResponse
    {
        $vendor = $this->getVendor($request);

        $product = Product::where('id', $id)
            ->where('vendor_id', $vendor->id)
            ->whereIn('status', ['draft', 'rejected'])
            ->firstOrFail();

        $product->update(['status' => 'pending_review']);

        // Notify admins
        $admins = \App\Models\User::whereIn('role', ['admin', 'super_admin'])->get();
        Notification::send($admins, new NewProductPendingNotification($product));

        return response()->json(['message' => 'Produit soumis pour révision.', 'product' => $product]);
    }

    // Variants
    public function variants(Request $request, int $id): JsonResponse
    {
        $vendor = $this->getVendor($request);
        $product = Product::where('id', $id)->where('vendor_id', $vendor->id)->firstOrFail();

        return response()->json([
            'variants' => $product->variants()->with('attributeValues.attributeType')->get(),
        ]);
    }

    public function storeVariant(Request $request, int $id): JsonResponse
    {
        $vendor = $this->getVendor($request);
        $product = Product::where('id', $id)->where('vendor_id', $vendor->id)->firstOrFail();

        $data = $request->validate([
            'sku' => ['nullable', 'string', 'max:100', 'unique:product_variants,sku'],
            'price' => ['required', 'numeric', 'min:0'],
            'compare_price' => ['nullable', 'numeric', 'min:0'],
            'stock' => ['nullable', 'integer', 'min:0'],
            'image_url' => ['nullable', 'url'],
            'is_active' => ['nullable', 'boolean'],
            'attribute_value_ids' => ['nullable', 'array'],
            'attribute_value_ids.*' => ['exists:attribute_values,id'],
        ]);

        $variant = $product->variants()->create($data);

        if (!empty($data['attribute_value_ids'])) {
            $variant->attributeValues()->sync($data['attribute_value_ids']);
        }

        return response()->json(['variant' => $variant->load('attributeValues')], 201);
    }

    public function updateVariant(Request $request, int $id, int $vid): JsonResponse
    {
        $vendor = $this->getVendor($request);
        $product = Product::where('id', $id)->where('vendor_id', $vendor->id)->firstOrFail();
        $variant = ProductVariant::where('id', $vid)->where('product_id', $product->id)->firstOrFail();

        $data = $request->validate([
            'sku' => ['nullable', 'string', 'max:100'],
            'price' => ['nullable', 'numeric', 'min:0'],
            'compare_price' => ['nullable', 'numeric', 'min:0'],
            'stock' => ['nullable', 'integer', 'min:0'],
            'image_url' => ['nullable', 'url'],
            'is_active' => ['nullable', 'boolean'],
            'attribute_value_ids' => ['nullable', 'array'],
            'attribute_value_ids.*' => ['exists:attribute_values,id'],
        ]);

        $variant->update($data);

        if (isset($data['attribute_value_ids'])) {
            $variant->attributeValues()->sync($data['attribute_value_ids']);
        }

        return response()->json(['variant' => $variant->load('attributeValues')]);
    }

    public function destroyVariant(Request $request, int $id, int $vid): JsonResponse
    {
        $vendor = $this->getVendor($request);
        $product = Product::where('id', $id)->where('vendor_id', $vendor->id)->firstOrFail();
        $variant = ProductVariant::where('id', $vid)->where('product_id', $product->id)->firstOrFail();

        $variant->delete();

        return response()->json(['message' => 'Variante supprimée avec succès.']);
    }

    // Attribute types
    public function attributeTypes(Request $request): JsonResponse
    {
        $vendor = $this->getVendor($request);

        $types = AttributeType::with('values')
            ->where('vendor_id', $vendor->id)
            ->orderBy('sort_order')
            ->get();

        return response()->json(['attribute_types' => $types]);
    }

    public function storeAttributeType(Request $request): JsonResponse
    {
        $vendor = $this->getVendor($request);

        $data = $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
        ]);

        $type = AttributeType::create(array_merge($data, ['vendor_id' => $vendor->id]));

        return response()->json(['attribute_type' => $type], 201);
    }

    public function storeAttributeValue(Request $request, int $id): JsonResponse
    {
        $vendor = $this->getVendor($request);
        $type = AttributeType::where('id', $id)->where('vendor_id', $vendor->id)->firstOrFail();

        $data = $request->validate([
            'value' => ['required', 'string', 'max:100'],
            'color_hex' => ['nullable', 'string', 'regex:/^#[0-9A-Fa-f]{6}$/'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
        ]);

        $value = $type->values()->create($data);

        return response()->json(['attribute_value' => $value], 201);
    }

    public function destroyAttributeType(Request $request, int $id): JsonResponse
    {
        $vendor = $this->getVendor($request);
        $type = AttributeType::where('id', $id)->where('vendor_id', $vendor->id)->firstOrFail();

        $type->delete();

        return response()->json(['message' => 'Type d\'attribut supprimé avec succès.']);
    }
}
