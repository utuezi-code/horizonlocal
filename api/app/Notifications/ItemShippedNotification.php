<?php

namespace App\Notifications;

use App\Models\OrderItem;
use App\Services\TrackingUrlGenerator;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ItemShippedNotification extends Notification implements ShouldQueue
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
        $mail = (new MailMessage)
            ->subject("Votre article a été expédié — Commande #{$this->orderItem->order_id}")
            ->greeting("Bonjour {$notifiable->name},")
            ->line("Votre article « {$this->orderItem->product_name} » a été expédié.");

        if ($this->orderItem->tracking_number && $this->orderItem->carrier) {
            $trackingUrl = app(TrackingUrlGenerator::class)->generate(
                $this->orderItem->carrier,
                $this->orderItem->tracking_number
            );

            if ($trackingUrl) {
                $mail->action('Suivre mon colis', $trackingUrl);
            } else {
                $mail->line("Numéro de suivi : {$this->orderItem->tracking_number}");
            }
        }

        return $mail->line("Merci d'avoir choisi Horizon Local!");
    }
}
