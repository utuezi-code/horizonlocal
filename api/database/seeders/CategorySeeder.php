<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            ['name' => 'Articles d\'extérieur / Rénovations',  'sort_order' => 1],
            ['name' => 'Articles de maison / Meubles',         'sort_order' => 2],
            ['name' => 'Électronique',                         'sort_order' => 3],
            ['name' => 'Animalerie',                           'sort_order' => 4],
            ['name' => 'Fournitures d\'art et d\'artisanat',   'sort_order' => 5],
            ['name' => 'Fournitures de bureau et scolaires',   'sort_order' => 6],
            ['name' => 'Beauté et soins personnels',           'sort_order' => 7],
            ['name' => 'Santé et bien-être',                   'sort_order' => 8],
            ['name' => 'Vêtements, chaussures et bijoux',      'sort_order' => 9],
        ];

        foreach ($categories as $category) {
            Category::updateOrCreate(
                ['slug' => Str::slug($category['name'])],
                array_merge($category, [
                    'slug' => Str::slug($category['name']),
                    'is_active' => true,
                ])
            );
        }
    }
}
