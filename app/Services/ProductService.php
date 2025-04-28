<?php

namespace App\Services;

use App\Models\Product;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Carbon;

class ProductService
{
    /**
     * Store a new product
     */
    public function store(array $data): array
    {
        $now = now();
        $data['total_value'] = $data['quantity'] * $data['price'];
        $data['created_at'] = $now;
        $data['updated_at'] = $now;

        // Store in database
        $product = Product::create($data);
        $data['id'] = $product->id;

        // Store in JSON
        $this->storeInJson($data);

        return $data;
    }

    public function update(int $id, array $data): array
    {
        $now = now();
        $data['total_value'] = $data['quantity'] * $data['price'];
        $data['updated_at'] = $now;

        // Update in database
        $product = Product::find($id);
        if ($product) {
            $product->update($data);
        }

        // Update in JSON
        $this->updateInJson($id, $data);

        return $data;
    }

    public function destroy(int $id): void
    {
        $now = now();
        $product = Product::find($id);
        if ($product) {
            $product->delete();
        }

        $this->deleteInJson($id, $now);
    }

    public function getAllProducts(): array
    {
        $dbProducts = Product::all()->toArray();
        $jsonProducts = $this->getJsonProducts();
        $allProducts = array_merge($dbProducts, $jsonProducts);
        $uniqueProducts = $this->deduplicateProducts($allProducts);

        return $this->sortProducts($uniqueProducts);
    }

    private function storeInJson(array $data): void
    {
        $products = $this->getJsonProducts();
        $maxId = $this->getMaxId($products);
        $data['id'] = $maxId + 1;
        $products[] = $data;
        Storage::put('products.json', json_encode($products, JSON_PRETTY_PRINT));
    }

    private function updateInJson(int $id, array $data): void
    {
        if (!Storage::exists('products.json')) {
            return;
        }

        $products = json_decode(Storage::get('products.json'), true);
        $productIndex = array_search($id, array_column($products, 'id'));

        if ($productIndex !== false) {
            $data['created_at'] = $products[$productIndex]['created_at'];
            $data['id'] = $id;
            $products[$productIndex] = $data;
            Storage::put('products.json', json_encode($products, JSON_PRETTY_PRINT));
        }
    }

    private function deleteInJson(int $id, Carbon $now): void
    {
        if (!Storage::exists('products.json')) {
            return;
        }

        $products = json_decode(Storage::get('products.json'), true);
        $productIndex = array_search($id, array_column($products, 'id'));

        if ($productIndex !== false) {
            $products[$productIndex]['deleted_at'] = $now->toDateTimeString();
            $products[$productIndex]['updated_at'] = $now->toDateTimeString();
            Storage::put('products.json', json_encode($products, JSON_PRETTY_PRINT));
        }
    }


    private function getJsonProducts(): array
    {
        $jsonProducts = [];
        if (Storage::exists('products.json')) {
            $jsonProducts = json_decode(Storage::get('products.json'), true);
            $jsonProducts = array_filter($jsonProducts, function($product) {
                return !isset($product['deleted_at']);
            });
            $jsonProducts = array_values($jsonProducts);
        }
        return $jsonProducts;
    }


    private function deduplicateProducts(array $products): array
    {
        $uniqueProducts = [];
        $seenNames = [];

        foreach ($products as $product) {
            $name = $product['product_name'];
            if (!isset($seenNames[$name])) {
                $seenNames[$name] = true;
                $uniqueProducts[] = $product;
            }
        }

        return $uniqueProducts;
    }

    private function sortProducts(array $products): array
    {
        usort($products, function($a, $b) {
            $timeA = strtotime($a['created_at']);
            $timeB = strtotime($b['created_at']);
            return $timeB - $timeA;
        });

        return $products;
    }

    private function getMaxId(array $products): int
    {
        $maxId = 0;
        foreach ($products as $product) {
            if (isset($product['id']) && $product['id'] > $maxId) {
                $maxId = $product['id'];
            }
        }
        return $maxId;
    }
}
