<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Http\Requests\ProductRequest;
use App\Services\ProductService;


class ProductController extends Controller
{
    protected $productService;

    public function __construct(ProductService $productService)
    {
        $this->productService = $productService;
    }

    public function index()
    {
        return view('products.index');
    }

    public function store(ProductRequest $request)
    {
        $data = $request->validated();
        $product = $this->productService->store($data);
        return response()->json($product);
    }

    public function getProducts()
    {
        $products = $this->productService->getAllProducts();
        return response()->json($products);
    }

    public function update(ProductRequest $request, $id)
    {
        $data = $request->validated();
        $product = $this->productService->update($id, $data);
        return response()->json($product);
    }

    public function destroy($id)
    {
        $this->productService->destroy($id);
        return response()->json(['message' => 'Product deleted successfully']);
    }
}
