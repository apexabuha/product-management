<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Product extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'product_name',
        'quantity',
        'price',
        'total_value',
        'created_at',
        'updated_at',
        'deleted_at'
    ];

    protected $casts = [
        'quantity' => 'integer',
        'price' => 'decimal:2',
        'total_value' => 'decimal:2',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime'
    ];

    protected $dates = [
        'created_at',
        'updated_at',
        'deleted_at'
    ];

    protected $hidden = [
        'deleted_at'
    ];

    // Automatically calculate total_value before saving
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($product) {
            $product->total_value = $product->quantity * $product->price;
        });

        static::updating(function ($product) {
            $product->total_value = $product->quantity * $product->price;
        });
    }

    // Scope to get only active (non-deleted) products
    public function scopeActive($query)
    {
        return $query->whereNull('deleted_at');
    }

    // Scope to get products with total value greater than a given amount
    public function scopeWithTotalValueGreaterThan($query, $amount)
    {
        return $query->where('total_value', '>', $amount);
    }

    // Accessor to format price with currency symbol
    public function getFormattedPriceAttribute()
    {
        return '$' . number_format($this->price, 2);
    }

    // Accessor to format total value with currency symbol
    public function getFormattedTotalValueAttribute()
    {
        return '$' . number_format($this->total_value, 2);
    }

    // Accessor to format quantity with commas
    public function getFormattedQuantityAttribute()
    {
        return number_format($this->quantity);
    }
}
