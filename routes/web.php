<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ProductController;

Route::get('/', [ProductController::class, 'index']);
Route::get('/products', [ProductController::class, 'getProducts']);
Route::post('/products', [ProductController::class, 'store']);
Route::put('/products/{index}', [ProductController::class, 'update']);
Route::delete('/products/{index}', [ProductController::class, 'destroy']);
