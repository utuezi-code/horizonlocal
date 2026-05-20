<?php

namespace App\Notifications;

use App\Models\Product;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ProductRejectedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public readonly Product $product,
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
            ->subject("Produit refusé — {$this->product->name}")
            ->greeting("Bonjour {$notifiable->name},")
            ->line("Votre produit « {$this->product->name} » a été refusé par notre équipe de modération.");

        if ($this->reason) {
            $mail->line("Raison : {$this->reason}");
        }

        return $mail
            ->line("Veuillez corriger votre produit et le soumettre à nouveau pour approbation.")
            ->action('Modifier le produit', config('app.frontend_url') . "/vendeur/produits/{$this->product->id}/modifier")
            ->line("Merci de votre compréhension.");
    }
}
