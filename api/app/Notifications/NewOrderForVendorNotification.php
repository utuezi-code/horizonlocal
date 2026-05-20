<?php

namespace App\Notifications;

use App\Models\Order;
use App\Models\Vendor;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class NewOrderForVendorNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public readonly Order $order,
        public readonly Vendor $vendor
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
            ->subject("Nouvelle commande #{$this->order->id} — Horizon Local")
            ->greeting("Bonjour {$notifiable->name},")
            ->line("Vous avez reçu une nouvelle commande (#{$this->order->id}) sur votre boutique {$this->vendor->store_name}.")
            ->action('Voir la commande', config('app.frontend_url') . "/vendeur/commandes/{$this->order->id}")
            ->line("Veuillez traiter cette commande dans les meilleurs délais.");
    }
}
