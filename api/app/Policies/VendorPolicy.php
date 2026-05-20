<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Vendor;

class VendorPolicy
{
    public function view(?User $user, Vendor $vendor): bool
    {
        return true;
    }

    public function update(User $user, Vendor $vendor): bool
    {
        if ($user->role === 'super_admin') {
            return true;
        }

        return $user->vendor?->id === $vendor->id;
    }

    public function approve(User $user, Vendor $vendor): bool
    {
        return $user->role === 'super_admin';
    }
}
