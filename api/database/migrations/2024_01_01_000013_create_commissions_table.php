<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('commissions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_item_id')->constrained('order_items')->cascadeOnDelete();
            $table->foreignId('vendor_id')->constrained('vendors')->restrictOnDelete();
            $table->decimal('amount', 10, 2);
            $table->decimal('platform_fee', 10, 2);
            $table->string('stripe_transfer_id')->nullable();
            $table->string('status', 20)->default('pending');
            $table->timestamp('transferred_at')->nullable();
            $table->timestamp('created_at')->useCurrent();

            $table->index('vendor_id');
            $table->index('status');
            $table->index('order_item_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('commissions');
    }
};
