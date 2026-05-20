<?php

namespace App\Http\Controllers\Vendor;

use App\Http\Controllers\Controller;
use App\Jobs\ProcessProductCsvImport;
use App\Models\ImportJob;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class CsvImportController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $vendor = $request->user()->vendor;

        if (!$vendor) {
            abort(403, 'Vous n\'avez pas de boutique associée.');
        }

        $request->validate([
            'file' => ['required', 'file', 'mimes:csv,txt', 'max:10240'],
        ]);

        $file = $request->file('file');
        $filename = 'imports/' . $vendor->id . '/' . time() . '_' . $file->getClientOriginalName();

        Storage::put($filename, file_get_contents($file->getRealPath()));

        $importJob = ImportJob::create([
            'vendor_id' => $vendor->id,
            'filename' => $filename,
            'status' => 'pending',
        ]);

        ProcessProductCsvImport::dispatch($importJob, $vendor);

        return response()->json([
            'message' => 'Importation démarrée.',
            'import_id' => $importJob->id,
        ], 202);
    }

    public function show(Request $request, int $id): JsonResponse
    {
        $vendor = $request->user()->vendor;

        if (!$vendor) {
            abort(403, 'Vous n\'avez pas de boutique associée.');
        }

        $importJob = ImportJob::where('id', $id)
            ->where('vendor_id', $vendor->id)
            ->firstOrFail();

        return response()->json(['import' => $importJob]);
    }

    public function template(): \Symfony\Component\HttpFoundation\StreamedResponse
    {
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="modele_produits.csv"',
        ];

        return response()->stream(function () {
            $handle = fopen('php://output', 'w');
            fputcsv($handle, [
                'name', 'description', 'short_description', 'sku',
                'price', 'compare_price', 'stock', 'manage_stock',
                'category_id', 'weight_kg', 'dimensions_cm',
            ]);
            // Example row
            fputcsv($handle, [
                'Exemple de produit', 'Description longue', 'Description courte',
                'SKU-001', '29.99', '39.99', '100', 'true', '1', '0.5', '10x10x10',
            ]);
            fclose($handle);
        }, 200, $headers);
    }
}
