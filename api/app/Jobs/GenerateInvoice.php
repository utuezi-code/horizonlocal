<?php

namespace App\Jobs;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class GenerateInvoice implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(public readonly Order $order)
    {
    }

    public function handle(): void
    {
        // TODO: Generate PDF invoice for the order
        // - Load order with items, customer, vendor details
        // - Generate PDF using a PDF library (e.g., DomPDF or Snappy)
        // - Store the PDF in cloud storage
        // - Send invoice email to customer
        // - Send copy to vendor(s)
    }
}
