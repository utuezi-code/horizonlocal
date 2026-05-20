<?php

namespace App\Jobs;

use App\Models\User;
use App\Notifications\PurgeWarningNotification;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class PurgeBeforeDeleteNotification implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(
        public readonly string $modelType,
        public readonly int $modelId,
        public readonly string $modelLabel
    ) {
    }

    public function handle(): void
    {
        $superAdmins = User::where('role', 'super_admin')->get();

        foreach ($superAdmins as $admin) {
            $admin->notify(new PurgeWarningNotification(
                $this->modelType,
                $this->modelId,
                $this->modelLabel
            ));
        }
    }
}
