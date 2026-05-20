<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('vendors', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('store_name');
            $table->string('store_slug')->unique();
            $table->text('description')->nullable();
            $table->string('logo_url')->nullable();
            $table->string('banner_url')->nullable();
            $table->string('address')->nullable();
            $table->string('city')->nullable();
            $table->char('province', 2)->nullable();
            $table->string('postal_code', 10)->nullable();
            $table->decimal('commission_rate', 5, 2)->default(10.00);
            $table->string('stripe_account_id')->nullable();
            $table->boolean('stripe_onboarded')->default(false);
            $table->string('status', 20)->default('pending');
            $table->softDeletes();
            $table->timestamps();

            $table->index('store_slug');
            $table->index('status');
            $table->index('user_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('vendors');
    }
};
