<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class MonthlyCommissionReportNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public readonly array $reportData,
        public readonly string $period
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
            ->subject("Rapport mensuel de commissions — {$this->period}")
            ->greeting("Bonjour {$notifiable->name},")
            ->line("Voici votre rapport de commissions pour la période {$this->period}.")
            ->line("Total des ventes : " . number_format($this->reportData['total_sales'] ?? 0, 2) . " $ CAD")
            ->line("Commissions gagnées : " . number_format($this->reportData['commission_earned'] ?? 0, 2) . " $ CAD")
            ->line("Virements reçus : " . number_format($this->reportData['transferred'] ?? 0, 2) . " $ CAD")
            ->action('Voir mes revenus détaillés', config('app.frontend_url') . '/vendeur/revenus')
            ->line("Merci de vendre sur Horizon Local!");
    }
}
