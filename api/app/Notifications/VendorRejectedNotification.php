<?php

namespace App\Notifications;

use App\Models\Vendor;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class VendorRejectedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public readonly Vendor $vendor,
        public readonly ?string $reason = null
    ) {
        $this->locale = 'fr';
    }

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $mail = (new MailMessage)
            ->subject("Mise à jour de votre demande de boutique — Horizon Local")
            ->greeting("Bonjour {$notifiable->name},")
            ->line("Nous regrettons de vous informer que votre boutique « {$this->vendor->store_name} » n'a pas été approuvée à ce moment.");

        if ($this->reason) {
            $mail->line("Raison : {$this->reason}");
        }

        return $mail
            ->line("Vous pouvez corriger les informations et soumettre à nouveau votre demande.")
            ->action('Accéder à mon compte', config('app.frontend_url') . '/compte')
            ->line("Merci de votre intérêt pour Horizon Local.");
    }
}
