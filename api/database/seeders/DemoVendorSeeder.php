<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Product;
use App\Models\ProductImage;
use App\Models\User;
use App\Models\Vendor;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DemoVendorSeeder extends Seeder
{
    public function run(): void
    {
        $vendors = [
            [
                'name'        => 'Colorantic Inc.',
                'email'       => 'contact@colorantic.ca',
                'store_name'  => 'Colorantic',
                'description' => 'Peinture à la craie 100% québécoise.',
                'city'        => 'Montréal',
                'province'    => 'QC',
                'products'    => [
                    ['name' => 'Baie d\'açaï 500ml',  'price' => 18.99, 'category' => 'fournitures-dart-et-dartisanat', 'stock' => 50, 'sku' => 'COL-500-BC'],
                    ['name' => 'Baie d\'açaï 1L',     'price' => 33.99, 'category' => 'fournitures-dart-et-dartisanat', 'stock' => 30, 'sku' => 'COL-1L-BC'],
                    ['name' => 'Baie d\'açaï 4L',     'price' => 89.99, 'category' => 'fournitures-dart-et-dartisanat', 'stock' => 15, 'sku' => 'COL-4L-BC'],
                ],
            ],
            [
                'name'        => 'JAY TOUT EN BOIS',
                'email'       => 'contact@jaytoutenbois.ca',
                'store_name'  => 'JAY TOUT EN BOIS',
                'description' => 'Meubles en bois massif fabriqués au Québec.',
                'city'        => 'Québec',
                'province'    => 'QC',
                'products'    => [
                    ['name' => 'Table La Irène (Chêne naturel)', 'price' => 350.00, 'category' => 'articles-de-maison-meubles', 'stock' => 5, 'sku' => 'JTB-IRENE-CH-NAT'],
                    ['name' => 'Table La Irène (Chêne noir)',    'price' => 380.00, 'category' => 'articles-de-maison-meubles', 'stock' => 3, 'sku' => 'JTB-IRENE-CH-NOI'],
                ],
            ],
        ];

        foreach ($vendors as $vendorData) {
            $user = User::updateOrCreate(
                ['email' => $vendorData['email']],
                [
                    'name'              => $vendorData['name'],
                    'password'          => Hash::make('changeme'),
                    'role'              => 'vendor',
                    'email_verified_at' => now(),
                ]
            );

            $vendor = Vendor::updateOrCreate(
                ['user_id' => $user->id],
                [
                    'store_name'      => $vendorData['store_name'],
                    'store_slug'      => Str::slug($vendorData['store_name']),
                    'description'     => $vendorData['description'],
                    'city'            => $vendorData['city'],
                    'province'        => $vendorData['province'],
                    'commission_rate' => 10.00,
                    'status'          => 'approved',
                ]
            );

            foreach ($vendorData['products'] as $productData) {
                $category = Category::where('slug', $productData['category'])->first();
                if (!$category) continue;

                $product = Product::updateOrCreate(
                    ['sku' => $productData['sku']],
                    [
                        'vendor_id'        => $vendor->id,
                        'category_id'      => $category->id,
                        'name'             => $productData['name'],
                        'slug'             => Str::slug($productData['name']) . '-' . $vendor->id,
                        'description'      => "Produit 100% québécois fabriqué par {$vendor->store_name}.",
                        'short_description' => 'Produit québécois de qualité.',
                        'price'            => $productData['price'],
                        'stock'            => $productData['stock'],
                        'status'           => 'published',
                        'is_featured'      => true,
                    ]
                );

                ProductImage::updateOrCreate(
                    ['product_id' => $product->id, 'sort_order' => 0],
                    [
                        'url'        => "https://placehold.co/600x600/1c61e7/ffffff?text=" . urlencode($product->name),
                        'alt_text'   => $product->name,
                        'is_primary' => true,
                    ]
                );
            }
        }
    }
}
