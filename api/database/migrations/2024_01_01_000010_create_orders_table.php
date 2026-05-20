<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('customer_id')->constrained('users')->restrictOnDelete();
            $table->string('status', 30)->default('pending_payment');
            $table->decimal('subtotal', 10, 2);
            $table->decimal('tax_gst', 10, 2);
            $table->decimal('tax_tvq', 10, 2);
            $table->decimal('shipping_cost', 10, 2)->default(0);
            $table->decimal('total', 10, 2);
            $table->char('currency', 3)->default('CAD');
            $table->string('stripe_payment_intent_id')->nullable();
            $table->string('shipping_name');
            $table->string('shipping_address');
            $table->string('shipping_city');
            $table->char('shipping_province', 2);
            $table->string('shipping_postal_code', 10);
            $table->text('notes')->nullable();
            $table->softDeletes();
            $table->timestamps();

            $table->index('customer_id');
            $table->index('status');
            $table->index('stripe_payment_intent_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
