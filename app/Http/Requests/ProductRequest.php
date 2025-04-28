<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ProductRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'product_name' => 'required|string|min:2|max:100|regex:/^[a-zA-Z0-9\s\-_]+$/',
            'quantity' => 'required|integer|min:0|max:999999',
            'price' => 'required|numeric|min:0|max:999999.99',
        ];
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'product_name.required' => 'Please enter a product name',
            'product_name.min' => 'Product name must be at least 2 characters long',
            'product_name.max' => 'Product name cannot exceed 100 characters',
            'product_name.regex' => 'Product name can only contain letters, numbers, spaces, hyphens, and underscores',
            'quantity.required' => 'Please enter a quantity',
            'quantity.integer' => 'Quantity must be a whole number',
            'quantity.min' => 'Quantity must be at least 0',
            'quantity.max' => 'Quantity cannot exceed 999999',
            'price.required' => 'Please enter a price',
            'price.numeric' => 'Please enter a valid price',
            'price.min' => 'Price must be at least 0',
            'price.max' => 'Price cannot exceed 999999.99',
        ];
    }
} 