<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class PurgeWarningNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public readonly string $modelType,
        public readonly int $modelId,
        public readonly string $modelLabel
    ) {
        $this->locale = 'fr';
    }

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject("Avertissement : suppression définitive imminente — Horizon Local")
            ->greeting("Bonjour {$notifiable->name},")
            ->line("Un enregistrement supprimé sera définitivement purgé dans 3 jours.")
            ->line("Type : {$this->modelType}")
            ->line("ID : {$this->modelId}")
            ->line("Description : {$this->modelLabel}")
            ->action('Accéder au panneau super admin', config('app.frontend_url') . '/super-admin/corbeille')
            ->line("Si vous souhaitez restaurer cet enregistrement, agissez avant la purge automatique.");
    }
}
