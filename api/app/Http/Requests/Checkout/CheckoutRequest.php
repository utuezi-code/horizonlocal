<?php

namespace App\Http\Requests\Checkout;

use Illuminate\Foundation\Http\FormRequest;

class CheckoutRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'shipping_name' => ['required', 'string', 'max:255'],
            'shipping_address' => ['required', 'string', 'max:255'],
            'shipping_city' => ['required', 'string', 'max:100'],
            'shipping_province' => ['required', 'string', 'size:2'],
            'shipping_postal_code' => ['required', 'string', 'max:10'],
            'payment_intent_id' => ['required', 'string'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ];
    }

    public function messages(): array
    {
        return [
            'shipping_name.required' => 'Le nom de livraison est obligatoire.',
            'shipping_address.required' => 'L\'adresse de livraison est obligatoire.',
            'shipping_city.required' => 'La ville est obligatoire.',
            'shipping_province.required' => 'La province est obligatoire.',
            'shipping_province.size' => 'La province doit être un code de 2 lettres (ex: QC).',
            'shipping_postal_code.required' => 'Le code postal est obligatoire.',
            'payment_intent_id.required' => 'L\'identifiant de paiement est obligatoire.',
        ];
    }
}
