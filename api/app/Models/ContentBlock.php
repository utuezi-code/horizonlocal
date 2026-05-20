<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ContentBlock extends Model
{
    use HasFactory;

    public $timestamps = false;

    protected $fillable = [
        'key',
        'label',
        'value',
        'type',
        'updated_by',
    ];

    protected function casts(): array
    {
        return [
            'updated_at' => 'datetime',
        ];
    }

    public function updatedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }
}
