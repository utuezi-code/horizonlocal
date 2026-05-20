<?php

namespace App\Http\Requests\Marketer;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreBannerRequest extends FormRequest
{
    public function authorize(): bool
    {
        return in_array($this->user()?->role, ['marketer', 'super_admin']);
    }

    public function rules(): array
    {
        return [
            'location' => [
                'required',
                Rule::in([
                    'homepage_hero', 'homepage_secondary',
                    'category', 'promotions_page', 'sidebar',
                ]),
            ],
            'title' => ['nullable', 'string', 'max:255'],
            'subtitle' => ['nullable', 'string'],
            'cta_text' => ['nullable', 'string', 'max:100'],
            'cta_url' => ['nullable', 'url'],
            'image_desktop_url' => ['nullable', 'url'],
            'image_mobile_url' => ['nullable', 'url'],
            'bg_color' => ['nullable', 'string', 'regex:/^#[0-9A-Fa-f]{6}$/'],
            'text_color' => ['nullable', 'string', 'regex:/^#[0-9A-Fa-f]{6}$/'],
            'is_active' => ['nullable', 'boolean'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
            'valid_from' => ['nullable', 'date'],
            'valid_until' => ['nullable', 'date', 'after:valid_from'],
        ];
    }

    public function messages(): array
    {
        return [
            'location.required' => 'L\'emplacement de la bannière est obligatoire.',
            'location.in' => 'L\'emplacement n\'est pas valide.',
            'bg_color.regex' => 'La couleur de fond doit être au format hexadécimal (#RRGGBB).',
            'text_color.regex' => 'La couleur du texte doit être au format hexadécimal (#RRGGBB).',
            'valid_until.after' => 'La date de fin doit être après la date de début.',
        ];
    }
}
