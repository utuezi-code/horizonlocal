<?php

namespace App\Notifications;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class OrderConfirmedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(public readonly Order $order)
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
            ->subject("Confirmation de commande #{$this->order->id} — Horizon Local")
            ->greeting("Bonjour {$notifiable->name},")
            ->line("Votre commande #{$this->order->id} a été confirmée avec succès.")
            ->line("Montant total : " . number_format((float) $this->order->total, 2) . " $ CAD")
            ->action('Voir ma commande', config('app.frontend_url') . "/compte/commandes/{$this->order->id}")
            ->line("Merci d'avoir magasiné chez Horizon Local!");
    }
}
