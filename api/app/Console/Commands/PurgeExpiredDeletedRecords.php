<?php

namespace App\Console\Commands;

use App\Models\AuditLog;
use App\Models\BlogPost;
use App\Models\Order;
use App\Models\Product;
use App\Models\Review;
use App\Models\User;
use App\Models\Vendor;
use Illuminate\Console\Command;

class PurgeExpiredDeletedRecords extends Command
{
    protected $signature = 'horizon:purge-deleted';
    protected $description = 'Supprime définitivement les enregistrements soft-deleted depuis > 30 jours';

    private array $models = [
        Product::class,
        Vendor::class,
        Order::class,
        BlogPost::class,
        Review::class,
        User::class,
    ];

    public function handle(): void
    {
        $cutoff = now()->subDays(30);

        foreach ($this->models as $model) {
            $expired = $model::onlyTrashed()
                ->where('deleted_at', '<', $cutoff)
                ->get();

            foreach ($expired as $record) {
                AuditLog::create([
                    'user_id'    => null,
                    'action'     => 'auto_purge',
                    'model_type' => class_basename($model),
                    'model_id'   => $record->id,
                    'payload'    => json_decode($record->toJson(), true),
                ]);
                $record->forceDelete();
            }

            $this->info(class_basename($model) . " : {$expired->count()} enregistrements purgés.");
        }
    }
}
