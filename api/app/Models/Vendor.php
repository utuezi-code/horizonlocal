<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Vendor extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id',
        'store_name',
        'store_slug',
        'description',
        'logo_url',
        'banner_url',
        'address',
        'city',
        'province',
        'postal_code',
        'commission_rate',
        'stripe_account_id',
        'stripe_onboarded',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'stripe_onboarded' => 'boolean',
            'commission_rate' => 'decimal:2',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function products(): HasMany
    {
        return $this->hasMany(Product::class);
    }

    public function orderItems(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function shippingZones(): HasMany
    {
        return $this->hasMany(VendorShippingZone::class);
    }

    public function attributeTypes(): HasMany
    {
        return $this->hasMany(AttributeType::class);
    }

    public function commissions(): HasMany
    {
        return $this->hasMany(Commission::class);
    }

    public function scopeApproved(Builder $query): Builder
    {
        return $query->where('status', 'approved');
    }
}
