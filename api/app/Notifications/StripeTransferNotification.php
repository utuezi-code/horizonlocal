<?php

namespace App\Notifications;

use App\Models\Commission;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class StripeTransferNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(public readonly Commission $commission)
    {
        $this->locale = 'fr';
    }

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Virement effectué — Horizon Local')
            ->greeting("Bonjour {$notifiable->name},")
            ->line("Un virement de " . number_format((float) $this->commission->amount, 2) . " $ CAD a été effectué sur votre compte Stripe.")
            ->line("Référence de transfert : {$this->commission->stripe_transfer_id}")
            ->action('Voir mes revenus', config('app.frontend_url') . '/vendeur/revenus')
            ->line("Merci de vendre sur Horizon Local!");
    }
}
