<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class VendorShippingZone extends Model
{
    use HasFactory;

    public $timestamps = false;

    protected $fillable = [
        'vendor_id',
        'zone_name',
        'provinces',
        'base_fee',
        'free_above',
        'per_kg_fee',
        'estimated_days_min',
        'estimated_days_max',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'provinces' => 'array',
            'base_fee' => 'decimal:2',
            'free_above' => 'decimal:2',
            'per_kg_fee' => 'decimal:2',
            'estimated_days_min' => 'integer',
            'estimated_days_max' => 'integer',
            'is_active' => 'boolean',
        ];
    }

    public function vendor(): BelongsTo
    {
        return $this->belongsTo(Vendor::class);
    }
}
