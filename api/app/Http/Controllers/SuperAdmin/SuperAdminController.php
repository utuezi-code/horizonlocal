<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use Illuminate\Http\JsonResponse;

class SuperAdminController extends Controller
{
    private array $modelMap = [
        'products'   => \App\Models\Product::class,
        'vendors'    => \App\Models\Vendor::class,
        'orders'     => \App\Models\Order::class,
        'blog_posts' => \App\Models\BlogPost::class,
        'reviews'    => \App\Models\Review::class,
        'users'      => \App\Models\User::class,
    ];

    public function deletedItems(string $model): JsonResponse
    {
        $modelClass = $this->resolveModel($model);

        return response()->json(
            $modelClass::onlyTrashed()->paginate(50)
        );
    }

    public function restore(string $model, int $id): JsonResponse
    {
        $modelClass = $this->resolveModel($model);
        $record = $modelClass::onlyTrashed()->findOrFail($id);
        $record->restore();

        AuditLog::create([
            'user_id'    => auth()->id(),
            'action'     => 'restore',
            'model_type' => $model,
            'model_id'   => $id,
            'ip_address' => request()->ip(),
        ]);

        return response()->json(['message' => 'Restauré avec succès.']);
    }

    public function hardDelete(string $model, int $id): JsonResponse
    {
        $modelClass = $this->resolveModel($model);
        $record = $modelClass::onlyTrashed()->findOrFail($id);

        AuditLog::create([
            'user_id'    => auth()->id(),
            'action'     => 'hard_delete',
            'model_type' => $model,
            'model_id'   => $id,
            'payload'    => json_decode($record->toJson(), true),
            'ip_address' => request()->ip(),
        ]);

        $record->forceDelete();

        return response()->json(['message' => 'Supprimé définitivement.']);
    }

    private function resolveModel(string $model): string
    {
        if (!isset($this->modelMap[$model])) {
            abort(404, "Modèle '{$model}' introuvable.");
        }
        return $this->modelMap[$model];
    }
}
