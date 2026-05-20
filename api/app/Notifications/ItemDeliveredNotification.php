<?php

namespace App\Notifications;

use App\Models\OrderItem;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ItemDeliveredNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(public readonly OrderItem $orderItem)
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
            ->subject("Votre article a été livré — Commande #{$this->orderItem->order_id}")
            ->greeting("Bonjour {$notifiable->name},")
            ->line("Votre article « {$this->orderItem->product_name} » a été livré avec succès.")
            ->action('Voir ma commande', config('app.frontend_url') . "/compte/commandes/{$this->orderItem->order_id}")
            ->line("Vous recevrez bientôt une invitation à laisser un avis sur votre achat.")
            ->line("Merci d'avoir magasiné chez Horizon Local!");
    }
}
