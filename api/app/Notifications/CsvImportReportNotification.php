<?php

namespace App\Notifications;

use App\Models\ImportJob;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class CsvImportReportNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(public readonly ImportJob $importJob)
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
            ->subject("Rapport d'importation CSV — {$this->importJob->filename}")
            ->greeting("Bonjour {$notifiable->name},")
            ->line("Votre importation CSV a été traitée.")
            ->line("Résultats :")
            ->line("- Total de lignes : {$this->importJob->total_rows}")
            ->line("- Succès : {$this->importJob->success_count}")
            ->line("- Erreurs : {$this->importJob->error_count}");

        if ($this->importJob->error_count > 0) {
            $mail->line("Des erreurs ont été détectées. Consultez le rapport pour plus de détails.");
        }

        return $mail
            ->action('Voir le rapport', config('app.frontend_url') . "/vendeur/importations/{$this->importJob->id}")
            ->line("Merci d'utiliser Horizon Local!");
    }
}
