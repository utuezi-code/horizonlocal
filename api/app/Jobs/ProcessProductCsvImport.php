<?php

namespace App\Jobs;

use App\Models\ImportJob;
use App\Models\Product;
use App\Models\Vendor;
use App\Notifications\CsvImportReportNotification;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ProcessProductCsvImport implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $timeout = 600;

    public function __construct(
        public readonly ImportJob $importJob,
        public readonly Vendor $vendor
    ) {
    }

    public function handle(): void
    {
        $this->importJob->update(['status' => 'processing']);

        $filePath = Storage::path($this->importJob->filename);

        if (!file_exists($filePath)) {
            $this->importJob->update(['status' => 'failed']);
            return;
        }

        $errors = [];
        $successCount = 0;
        $errorCount = 0;
        $totalRows = 0;
        $processedRows = 0;

        $handle = fopen($filePath, 'r');
        $headers = fgetcsv($handle);

        // Count total rows first
        while (fgetcsv($handle) !== false) {
            $totalRows++;
        }
        rewind($handle);
        fgetcsv($handle); // Skip headers again

        $this->importJob->update(['total_rows' => $totalRows]);

        $chunk = [];
        $chunkSize = 100;
        $rowNumber = 1;

        while (($row = fgetcsv($handle)) !== false) {
            if (count($headers) !== count($row)) {
                $errors[] = "Ligne {$rowNumber}: nombre de colonnes incorrect.";
                $errorCount++;
                $rowNumber++;
                continue;
            }

            $data = array_combine($headers, $row);
            $chunk[] = ['row' => $rowNumber, 'data' => $data];
            $rowNumber++;

            if (count($chunk) >= $chunkSize) {
                [$s, $e, $errs] = $this->processChunk($chunk);
                $successCount += $s;
                $errorCount += $e;
                $errors = array_merge($errors, $errs);
                $processedRows += count($chunk);
                $chunk = [];

                $this->importJob->update([
                    'processed_rows' => $processedRows,
                    'success_count' => $successCount,
                    'error_count' => $errorCount,
                ]);
            }
        }

        if (!empty($chunk)) {
            [$s, $e, $errs] = $this->processChunk($chunk);
            $successCount += $s;
            $errorCount += $e;
            $errors = array_merge($errors, $errs);
            $processedRows += count($chunk);
        }

        fclose($handle);

        $this->importJob->update([
            'status' => 'done',
            'processed_rows' => $processedRows,
            'success_count' => $successCount,
            'error_count' => $errorCount,
            'errors' => $errors,
        ]);

        $this->vendor->user->notify(new CsvImportReportNotification($this->importJob));
    }

    private function processChunk(array $chunk): array
    {
        $successCount = 0;
        $errorCount = 0;
        $errors = [];

        foreach ($chunk as $item) {
            $rowNumber = $item['row'];
            $data = $item['data'];

            try {
                $this->validateRow($data, $rowNumber);

                $slug = Str::slug($data['name'] ?? '') . '-' . Str::random(6);

                Product::create([
                    'vendor_id' => $this->vendor->id,
                    'category_id' => $data['category_id'] ?? null,
                    'name' => $data['name'],
                    'slug' => $slug,
                    'description' => $data['description'] ?? null,
                    'short_description' => $data['short_description'] ?? null,
                    'sku' => $data['sku'] ?? null,
                    'price' => $data['price'],
                    'compare_price' => $data['compare_price'] ?? null,
                    'stock' => $data['stock'] ?? 0,
                    'manage_stock' => ($data['manage_stock'] ?? 'true') === 'true',
                    'status' => 'draft',
                ]);

                $successCount++;
            } catch (\Throwable $e) {
                $errors[] = "Ligne {$rowNumber}: " . $e->getMessage();
                $errorCount++;
            }
        }

        return [$successCount, $errorCount, $errors];
    }

    private function validateRow(array $data, int $rowNumber): void
    {
        if (empty($data['name'])) {
            throw new \InvalidArgumentException('Le champ "name" est requis.');
        }

        if (!isset($data['price']) || !is_numeric($data['price'])) {
            throw new \InvalidArgumentException('Le champ "price" doit être un nombre valide.');
        }

        if ((float) $data['price'] < 0) {
            throw new \InvalidArgumentException('Le prix ne peut pas être négatif.');
        }
    }
}
