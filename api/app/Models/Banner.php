<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Banner extends Model
{
    use HasFactory;

    protected $fillable = [
        'location',
        'title',
        'subtitle',
        'cta_text',
        'cta_url',
        'image_desktop_url',
        'image_mobile_url',
        'bg_color',
        'text_color',
        'is_active',
        'sort_order',
        'valid_from',
        'valid_until',
        'created_by',
        'updated_by',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'sort_order' => 'integer',
            'valid_from' => 'datetime',
            'valid_until' => 'datetime',
        ];
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function updatedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }
}
