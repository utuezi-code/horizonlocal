<?php

namespace App\Policies;

use App\Models\Product;
use App\Models\User;

class ProductPolicy
{
    public function viewAny(?User $user): bool
    {
        return true;
    }

    public function view(?User $user, Product $product): bool
    {
        return true;
    }

    public function create(User $user): bool
    {
        return in_array($user->role, ['vendor', 'super_admin']);
    }

    public function update(User $user, Product $product): bool
    {
        if ($user->role === 'super_admin') {
            return true;
        }

        if ($user->role === 'vendor') {
            return $user->vendor?->id === $product->vendor_id;
        }

        return false;
    }

    public function delete(User $user, Product $product): bool
    {
        if ($user->role === 'super_admin') {
            return true;
        }

        if ($user->role === 'vendor') {
            return $user->vendor?->id === $product->vendor_id;
        }

        return false;
    }
}
