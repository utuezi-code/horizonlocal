<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('vendor_shipping_zones', function (Blueprint $table) {
            $table->id();
            $table->foreignId('vendor_id')->constrained('vendors')->cascadeOnDelete();
            $table->string('zone_name', 100);
            $table->jsonb('provinces')->default('[]');
            $table->decimal('base_fee', 10, 2)->default(0);
            $table->decimal('free_above', 10, 2)->nullable();
            $table->decimal('per_kg_fee', 10, 2)->default(0);
            $table->integer('estimated_days_min')->default(3);
            $table->integer('estimated_days_max')->default(7);
            $table->boolean('is_active')->default(true);

            $table->index('vendor_id');
            $table->index('is_active');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('vendor_shipping_zones');
    }
};
