<?php

namespace App\Notifications;

use App\Models\OrderItem;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ItemCancelledNotification extends Notification implements ShouldQueue
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
            ->subject("Article annulé — Commande #{$this->orderItem->order_id}")
            ->greeting("Bonjour {$notifiable->name},")
            ->line("Votre article « {$this->orderItem->product_name} » a été annulé.")
            ->line("Si vous avez des questions, veuillez contacter notre service client.")
            ->action('Voir ma commande', config('app.frontend_url') . "/compte/commandes/{$this->orderItem->order_id}")
            ->line("Nous nous excusons pour le désagrément.");
    }
}
