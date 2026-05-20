<?php

namespace App\Notifications;

use App\Models\Vendor;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class VendorApprovedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(public readonly Vendor $vendor)
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
            ->subject("Votre boutique a été approuvée — Horizon Local")
            ->greeting("Félicitations, {$notifiable->name}!")
            ->line("Votre boutique « {$this->vendor->store_name} » a été approuvée et est maintenant visible sur Horizon Local.")
            ->action('Accéder à mon tableau de bord', config('app.frontend_url') . '/vendeur/tableau-de-bord')
            ->line("Commencez à ajouter vos produits et à vendre dès aujourd'hui!");
    }
}
