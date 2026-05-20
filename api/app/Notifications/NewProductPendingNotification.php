<?php

namespace App\Notifications;

use App\Models\Product;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class NewProductPendingNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(public readonly Product $product)
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
            ->subject("Nouveau produit en attente d'approbation — {$this->product->name}")
            ->greeting("Bonjour {$notifiable->name},")
            ->line("Un nouveau produit a été soumis pour approbation sur Horizon Local.")
            ->line("Produit : {$this->product->name}")
            ->line("Vendeur : {$this->product->vendor?->store_name}")
            ->line("Prix : " . number_format((float) $this->product->price, 2) . " $ CAD")
            ->action('Examiner le produit', config('app.frontend_url') . "/admin/produits/{$this->product->id}")
            ->line("Veuillez examiner et approuver ou refuser ce produit dans les meilleurs délais.");
    }
}
