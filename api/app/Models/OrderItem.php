<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;

class OrderItem extends Model
{
    use HasFactory, SoftDeletes;

    public $timestamps = false;

    protected $fillable = [
        'order_id',
        'product_id',
        'vendor_id',
        'variant_id',
        'product_name',
        'unit_price',
        'quantity',
        'subtotal',
        'commission_rate',
        'commission_amount',
        'vendor_amount',
        'fulfillment_status',
        'tracking_number',
        'carrier',
        'shipped_at',
        'delivered_at',
        'estimated_delivery_date',
    ];

    protected function casts(): array
    {
        return [
            'unit_price' => 'decimal:2',
            'subtotal' => 'decimal:2',
            'commission_rate' => 'decimal:2',
            'commission_amount' => 'decimal:2',
            'vendor_amount' => 'decimal:2',
            'quantity' => 'integer',
            'shipped_at' => 'datetime',
            'delivered_at' => 'datetime',
            'estimated_delivery_date' => 'date',
        ];
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function vendor(): BelongsTo
    {
        return $this->belongsTo(Vendor::class);
    }

    public function variant(): BelongsTo
    {
        return $this->belongsTo(ProductVariant::class, 'variant_id');
    }

    public function commission(): HasOne
    {
        return $this->hasOne(Commission::class);
    }
}
