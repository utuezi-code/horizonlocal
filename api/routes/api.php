<?php

use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\Auth\PasswordController;
use App\Http\Controllers\Catalog\CategoryController;
use App\Http\Controllers\Catalog\ProductController;
use App\Http\Controllers\Catalog\SearchController;
use App\Http\Controllers\Checkout\CheckoutController;
use App\Http\Controllers\Checkout\StripeController;
use App\Http\Controllers\Customer\CartController;
use App\Http\Controllers\Customer\OrderController;
use App\Http\Controllers\Customer\ReviewController;
use App\Http\Controllers\Customer\WishlistController;
use App\Http\Controllers\Vendor\VendorController;
use App\Http\Controllers\Vendor\VendorProductController;
use App\Http\Controllers\Vendor\VendorOrderController;
use App\Http\Controllers\Vendor\VendorEarningsController;
use App\Http\Controllers\Vendor\VendorShippingController;
use App\Http\Controllers\Vendor\VendorDashboardController;
use App\Http\Controllers\Vendor\CsvImportController;
use App\Http\Controllers\Admin\AdminDashboardController;
use App\Http\Controllers\Admin\AdminVendorController;
use App\Http\Controllers\Admin\AdminProductController;
use App\Http\Controllers\Admin\AdminOrderController;
use App\Http\Controllers\Admin\CommissionController;
use App\Http\Controllers\Admin\PartnerRequestController;
use App\Http\Controllers\Marketer\BannerController;
use App\Http\Controllers\Marketer\BlogController;
use App\Http\Controllers\Marketer\ContentBlockController;
use App\Http\Controllers\Marketer\DiscountController;
use App\Http\Controllers\Marketer\PromotionController;
use App\Http\Controllers\SuperAdmin\SuperAdminController;
use App\Http\Controllers\Privacy\PrivacyController;
use App\Http\Controllers\HealthController;
use Illuminate\Support\Facades\Route;

// Health check
Route::get('/health', [HealthController::class, 'check']);

// Stripe webhook (no auth, raw body needed)
Route::post('/webhooks/stripe', [StripeController::class, 'webhook']);

// Public catalog
Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/featured', [ProductController::class, 'featured']);
Route::get('/products/{slug}', [ProductController::class, 'show']);
Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/categories/{slug}', [CategoryController::class, 'show']);
Route::get('/categories/{slug}/products', [CategoryController::class, 'products']);
Route::get('/vendors', [VendorController::class, 'index']);
Route::get('/vendors/{slug}', [VendorController::class, 'show']);
Route::get('/search', [SearchController::class, 'index']);

// Public blog (read-only)
Route::get('/blog', [BlogController::class, 'index']);
Route::get('/blog/{slug}', [\App\Http\Controllers\Catalog\BlogPostController::class, 'show'])->missing(fn() => response()->json(['message' => 'Article introuvable.'], 404));

// Public banners & promotions
Route::get('/banners', [BannerController::class, 'index']);
Route::get('/promotions', [PromotionController::class, 'index']);
Route::get('/content-blocks', [ContentBlockController::class, 'index']);

// Auth
Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/forgot-password', [PasswordController::class, 'forgotPassword']);
    Route::post('/reset-password', [PasswordController::class, 'resetPassword']);

    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::get('/me', [AuthController::class, 'me']);
    });
});

// Authenticated routes
Route::middleware('auth:sanctum')->group(function () {

    // Cart (supports guest via session_id header)
    Route::prefix('cart')->group(function () {
        Route::get('/', [CartController::class, 'show']);
        Route::post('/items', [CartController::class, 'addItem']);
        Route::put('/items/{id}', [CartController::class, 'updateItem']);
        Route::delete('/items/{id}', [CartController::class, 'removeItem']);
        Route::delete('/', [CartController::class, 'clear']);
    });

    // Checkout
    Route::prefix('checkout')->group(function () {
        Route::post('/shipping', [CheckoutController::class, 'calculateShipping']);
        Route::post('/taxes', [CheckoutController::class, 'calculateTaxes']);
        Route::post('/payment-intent', [CheckoutController::class, 'createPaymentIntent']);
    });

    // My account
    Route::prefix('my-account')->group(function () {
        Route::get('/orders', [OrderController::class, 'index']);
        Route::get('/orders/{id}', [OrderController::class, 'show']);
    });

    // Wishlist
    Route::get('/wishlist', [WishlistController::class, 'index']);
    Route::post('/wishlist/{product_id}', [WishlistController::class, 'store']);
    Route::delete('/wishlist/{product_id}', [WishlistController::class, 'destroy']);

    // Reviews
    Route::post('/reviews', [ReviewController::class, 'store']);

    // Privacy (Loi 25)
    Route::prefix('privacy')->group(function () {
        Route::get('/my-data', [PrivacyController::class, 'myData']);
        Route::post('/delete-request', [PrivacyController::class, 'deleteRequest']);
        Route::put('/correction', [PrivacyController::class, 'correction']);
    });

    // Vendor dashboard
    Route::middleware('role:vendor,super_admin')->prefix('vendor')->group(function () {
        Route::get('/dashboard', [VendorDashboardController::class, 'index']);

        // Products
        Route::get('/products', [VendorProductController::class, 'index']);
        Route::post('/products', [VendorProductController::class, 'store']);
        Route::get('/products/{id}', [VendorProductController::class, 'show']);
        Route::put('/products/{id}', [VendorProductController::class, 'update']);
        Route::delete('/products/{id}', [VendorProductController::class, 'destroy']);
        Route::post('/products/{id}/submit', [VendorProductController::class, 'submit']);

        // Variants
        Route::get('/products/{id}/variants', [VendorProductController::class, 'variants']);
        Route::post('/products/{id}/variants', [VendorProductController::class, 'storeVariant']);
        Route::put('/products/{id}/variants/{vid}', [VendorProductController::class, 'updateVariant']);
        Route::delete('/products/{id}/variants/{vid}', [VendorProductController::class, 'destroyVariant']);

        // Attribute types
        Route::get('/attribute-types', [VendorProductController::class, 'attributeTypes']);
        Route::post('/attribute-types', [VendorProductController::class, 'storeAttributeType']);
        Route::post('/attribute-types/{id}/values', [VendorProductController::class, 'storeAttributeValue']);
        Route::delete('/attribute-types/{id}', [VendorProductController::class, 'destroyAttributeType']);

        // Orders
        Route::get('/orders', [VendorOrderController::class, 'index']);
        Route::get('/orders/{id}', [VendorOrderController::class, 'show']);
        Route::put('/orders/{id}/fulfillment', [VendorOrderController::class, 'updateFulfillment']);

        // Earnings
        Route::get('/earnings', [VendorEarningsController::class, 'index']);

        // Shipping zones
        Route::apiResource('shipping-zones', VendorShippingController::class);

        // CSV import
        Route::post('/products/import', [CsvImportController::class, 'store']);
        Route::get('/products/csv-template', [CsvImportController::class, 'template']);
        Route::get('/imports/{id}/status', [CsvImportController::class, 'show']);

        // Stripe Connect
        Route::post('/stripe/connect', [VendorDashboardController::class, 'stripeConnect']);
    });

    // Admin dashboard
    Route::middleware('role:admin,super_admin')->prefix('admin')->group(function () {
        Route::get('/metrics/financial', [AdminDashboardController::class, 'financial']);
        Route::get('/metrics/platform', [AdminDashboardController::class, 'platform']);
        Route::get('/metrics/shipping', [AdminDashboardController::class, 'shipping']);

        Route::get('/vendors', [AdminVendorController::class, 'index']);
        Route::put('/vendors/{id}/approve', [AdminVendorController::class, 'approve']);
        Route::put('/vendors/{id}/suspend', [AdminVendorController::class, 'suspend']);

        Route::get('/products', [AdminProductController::class, 'index']);
        Route::put('/products/{id}/approve', [AdminProductController::class, 'approve']);
        Route::put('/products/{id}/reject', [AdminProductController::class, 'reject']);

        Route::get('/orders', [AdminOrderController::class, 'index']);
        Route::get('/orders/{id}', [AdminOrderController::class, 'show']);
        Route::put('/orders/{id}/status', [AdminOrderController::class, 'updateStatus']);

        Route::get('/commissions', [CommissionController::class, 'index']);
        Route::post('/commissions/{id}/retry', [CommissionController::class, 'retry']);

        Route::get('/partner-requests', [PartnerRequestController::class, 'index']);
        Route::put('/partner-requests/{id}', [PartnerRequestController::class, 'update']);
    });

    // Marketer dashboard
    Route::middleware('role:marketer,super_admin')->prefix('marketer')->group(function () {
        Route::apiResource('banners', BannerController::class)->except(['index']);
        Route::apiResource('promotions', PromotionController::class)->except(['index', 'show']);
        Route::apiResource('discounts', DiscountController::class)->except(['show']);
        Route::apiResource('blog', BlogController::class)->except(['index']);
        Route::get('/content-blocks', [ContentBlockController::class, 'index']);
        Route::put('/content-blocks/{key}', [ContentBlockController::class, 'update']);
    });

    // Super Admin
    Route::middleware('role:super_admin')->prefix('super-admin')->group(function () {
        Route::get('/deleted/{model}', [SuperAdminController::class, 'deletedItems']);
        Route::post('/restore/{model}/{id}', [SuperAdminController::class, 'restore']);
        Route::delete('/hard-delete/{model}/{id}', [SuperAdminController::class, 'hardDelete']);
    });
});
