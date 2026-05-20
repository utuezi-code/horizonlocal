<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('promotions', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('image_url')->nullable();
            $table->string('discount_type', 30)->nullable();
            $table->decimal('discount_value', 10, 2)->nullable();
            $table->string('code', 50)->unique()->nullable();
            $table->string('applies_to', 30)->nullable();
            $table->unsignedBigInteger('applies_to_id')->nullable();
            $table->decimal('min_order_amount', 10, 2)->nullable();
            $table->integer('max_uses')->nullable();
            $table->integer('uses_count')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamp('starts_at');
            $table->timestamp('ends_at')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index('code');
            $table->index('is_active');
            $table->index('starts_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('promotions');
    }
};
