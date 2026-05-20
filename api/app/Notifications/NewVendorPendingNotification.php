<?php

namespace App\Notifications;

use App\Models\Vendor;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class NewVendorPendingNotification extends Notification implements ShouldQueue
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
            ->subject("Nouveau vendeur en attente d'approbation — {$this->vendor->store_name}")
            ->greeting("Bonjour {$notifiable->name},")
            ->line("Un nouveau vendeur a soumis une demande d'inscription sur Horizon Local.")
            ->line("Boutique : {$this->vendor->store_name}")
            ->line("Ville : {$this->vendor->city}, {$this->vendor->province}")
            ->action('Examiner la demande', config('app.frontend_url') . "/admin/vendeurs/{$this->vendor->id}")
            ->line("Veuillez examiner et approuver ou refuser cette demande dans les meilleurs délais.");
    }
}
