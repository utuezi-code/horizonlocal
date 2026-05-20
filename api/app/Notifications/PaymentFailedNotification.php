<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class PaymentFailedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public readonly string $paymentIntentId,
        public readonly ?float $amount = null
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
            ->subject('Échec du paiement — Horizon Local')
            ->greeting("Bonjour {$notifiable->name},")
            ->line('Votre paiement n\'a pas pu être traité.');

        if ($this->amount !== null) {
            $mail->line('Montant tenté : ' . number_format($this->amount, 2) . ' $ CAD');
        }

        return $mail
            ->action('Réessayer le paiement', config('app.frontend_url') . '/panier')
            ->line('Si le problème persiste, veuillez vérifier vos informations de paiement ou contacter votre banque.');
    }
}
