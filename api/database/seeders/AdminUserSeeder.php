<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => 'alain@horizonlocal.ca'],
            [
                'name'              => 'Alain SAWADOGO',
                'password'          => Hash::make('changeme'),
                'role'              => 'super_admin',
                'email_verified_at' => now(),
            ]
        );

        User::updateOrCreate(
            ['email' => 'admin@horizonlocal.ca'],
            [
                'name'              => 'Admin Horizon Local',
                'password'          => Hash::make('changeme'),
                'role'              => 'admin',
                'email_verified_at' => now(),
            ]
        );

        User::updateOrCreate(
            ['email' => 'marketeur@horizonlocal.ca'],
            [
                'name'              => 'Marketeur Horizon Local',
                'password'          => Hash::make('changeme'),
                'role'              => 'marketer',
                'email_verified_at' => now(),
            ]
        );
    }
}
