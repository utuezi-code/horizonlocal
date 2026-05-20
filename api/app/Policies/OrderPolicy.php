<?php

namespace App\Policies;

use App\Models\Order;
use App\Models\User;

class OrderPolicy
{
    public function view(User $user, Order $order): bool
    {
        if (in_array($user->role, ['super_admin', 'admin'])) {
            return true;
        }

        return $order->customer_id === $user->id;
    }

    public function update(User $user, Order $order): bool
    {
        return in_array($user->role, ['super_admin', 'admin']);
    }
}
