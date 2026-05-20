<?php

namespace App\Http\Requests\Vendor;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateFulfillmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'fulfillment_status' => [
                'required',
                Rule::in([
                    'pending', 'processing', 'packed', 'shipped',
                    'in_transit', 'delivered', 'completed', 'cancelled', 'refunded',
                ]),
            ],
            'tracking_number' => ['nullable', 'string', 'max:100'],
            'carrier' => ['nullable', 'string', 'max:50'],
            'estimated_delivery_date' => ['nullable', 'date'],
        ];
    }

    public function messages(): array
    {
        return [
            'fulfillment_status.required' => 'Le statut d\'expédition est obligatoire.',
            'fulfillment_status.in' => 'Le statut d\'expédition n\'est pas valide.',
        ];
    }
}
