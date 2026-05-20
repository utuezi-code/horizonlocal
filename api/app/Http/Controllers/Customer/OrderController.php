<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Services\CartService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    public function __construct(private readonly CartService $cartService) {}

    public function index(Request $request): JsonResponse
    {
        $query = Order::with(['items.product.images', 'items.vendor:id,store_name'])
            ->where('customer_id', $request->user()->id)
            ->orderBy('created_at', 'desc');

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        return response()->json($query->paginate($request->get('per_page', 10)));
    }

    public function show(Request $request, int $id): JsonResponse
    {
        $order = Order::with([
            'items.product.images',
            'items.variant',
            'items.vendor:id,store_name',
            'statusHistory',
        ])
            ->where('customer_id', $request->user()->id)
            ->findOrFail($id);

        return response()->json(['order' => $order]);
    }

    public function cancel(Request $request, int $id): JsonResponse
    {
        $order = Order::where('customer_id', $request->user()->id)->findOrFail($id);

        if (!in_array($order->status, ['pending', 'confirmed'])) {
            return response()->json(['message' => 'Cette commande ne peut plus être annulée.'], 422);
        }

        $order->update(['status' => 'cancelled']);
        $order->statusHistory()->create([
            'status'     => 'cancelled',
            'note'       => 'Annulée par le client.',
            'changed_by' => $request->user()->id,
        ]);

        return response()->json(['message' => 'Commande annulée avec succès.', 'order' => $order]);
    }

    public function requestReturn(Request $request, int $id): JsonResponse
    {
        $request->validate(['reason' => ['nullable', 'string', 'max:500']]);

        $order = Order::where('customer_id', $request->user()->id)->findOrFail($id);

        if ($order->status !== 'delivered') {
            return response()->json(['message' => 'Seules les commandes livrées peuvent faire l\'objet d\'un retour.'], 422);
        }

        if ($order->updated_at->diffInDays(now()) > 30) {
            return response()->json(['message' => 'Le délai de retour de 30 jours est dépassé.'], 422);
        }

        $order->update(['status' => 'return_requested']);
        $order->statusHistory()->create([
            'status'     => 'return_requested',
            'note'       => 'Retour demandé par le client. Raison : ' . ($request->reason ?? 'Non spécifiée.'),
            'changed_by' => $request->user()->id,
        ]);

        return response()->json(['message' => 'Demande de retour soumise. Un vendeur vous contactera sous 48h.']);
    }

    public function rebuy(Request $request, int $id): JsonResponse
    {
        $order = Order::with('items.product')->where('customer_id', $request->user()->id)->findOrFail($id);
        $cart  = $this->cartService->getOrCreate($request->user()->id, null);

        foreach ($order->items as $item) {
            if ($item->product && $item->product->status === 'published') {
                try {
                    $this->cartService->addItem($cart, $item->product_id, $item->variant_id, $item->quantity);
                } catch (\RuntimeException) {
                    // Skip out-of-stock items silently
                }
            }
        }

        return response()->json(['message' => 'Articles rajoutés au panier.']);
    }
}
