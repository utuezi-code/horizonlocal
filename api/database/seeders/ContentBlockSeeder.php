<?php

namespace Database\Seeders;

use App\Models\ContentBlock;
use Illuminate\Database\Seeder;

class ContentBlockSeeder extends Seeder
{
    public function run(): void
    {
        $blocks = [
            ['key' => 'homepage_hero_title',    'label' => 'Titre principal accueil',     'value' => 'Produits 100% québécois'],
            ['key' => 'homepage_hero_subtitle', 'label' => 'Sous-titre accueil',          'value' => "Votre plate-forme qui garantit et encourage le savoir-faire d'ici."],
            ['key' => 'homepage_offer_title',   'label' => 'Titre section Offre du mois', 'value' => 'Offre du mois'],
            ['key' => 'footer_tagline',         'label' => 'Slogan footer',               'value' => "L'innovation au service des entreprises Québécoises."],
            ['key' => 'about_short',            'label' => 'À propos (court)',            'value' => "Horizon Local connecte les acheteurs aux entreprises et artisans québécois."],
        ];

        foreach ($blocks as $block) {
            ContentBlock::updateOrCreate(
                ['key' => $block['key']],
                array_merge($block, ['type' => 'text']),
            );
        }
    }
}
