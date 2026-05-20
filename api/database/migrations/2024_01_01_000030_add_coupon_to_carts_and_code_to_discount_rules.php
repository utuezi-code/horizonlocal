<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('carts', function (Blueprint $table) {
            $table->string('coupon_code', 50)->nullable()->after('session_id');
            $table->decimal('discount_amount', 10, 2)->default(0)->after('coupon_code');
        });

        Schema::table('discount_rules', function (Blueprint $table) {
            $table->string('code', 50)->nullable()->unique()->after('name');
            $table->timestamp('expires_at')->nullable()->after('ends_at');
        });

        Schema::table('orders', function (Blueprint $table) {
            if (!Schema::hasColumn('orders', 'tracking_number')) {
                $table->string('tracking_number', 100)->nullable()->after('status');
            }
            if (!Schema::hasColumn('orders', 'carrier')) {
                $table->string('carrier', 50)->nullable()->after('tracking_number');
            }
        });
    }

    public function down(): void
    {
        Schema::table('carts', function (Blueprint $table) {
            $table->dropColumn(['coupon_code', 'discount_amount']);
        });
        Schema::table('discount_rules', function (Blueprint $table) {
            $table->dropColumn(['code', 'expires_at']);
        });
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn(['tracking_number', 'carrier']);
        });
    }
};
