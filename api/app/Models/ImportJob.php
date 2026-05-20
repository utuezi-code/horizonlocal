<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ImportJob extends Model
{
    use HasFactory;

    protected $fillable = [
        'vendor_id',
        'filename',
        'status',
        'total_rows',
        'processed_rows',
        'success_count',
        'error_count',
        'errors',
    ];

    protected function casts(): array
    {
        return [
            'errors' => 'array',
            'total_rows' => 'integer',
            'processed_rows' => 'integer',
            'success_count' => 'integer',
            'error_count' => 'integer',
        ];
    }

    public function vendor(): BelongsTo
    {
        return $this->belongsTo(Vendor::class);
    }
}
