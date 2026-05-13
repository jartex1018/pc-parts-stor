'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { ChevronDown } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  price: number;
  image_url: string;
  stock: number;
  brand: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const supabase = createClient();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedCategory, setSelectedCategory] = useState<string>(
    searchParams.get('category') || ''
  );
  const [priceRange, setPriceRange] = useState([0, 2000]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('newest');
  const [brands, setBrands] = useState<string[]>([]);

  useEffect(() => {
    async function fetchData() {
      // Fetch categories
      const { data: categoriesData } = await supabase
        .from('categories')
        .select('id, name, slug')
        .order('display_order');

      if (categoriesData) {
        setCategories(categoriesData);
      }

      // Fetch all brands
      const { data: brandsData } = await supabase
        .from('products')
        .select('brand')
        .order('brand');

      if (brandsData) {
        const uniqueBrands = Array.from(new Set(brandsData.map((p) => p.brand)));
        setBrands(uniqueBrands as string[]);
      }

      setLoading(false);
    }

    fetchData();
  }, []);

  useEffect(() => {
    async function fetchProducts() {
      let query = supabase.from('products').select('*');

      // Filter by category
      if (selectedCategory) {
        const category = categories.find((c) => c.slug === selectedCategory);
        if (category) {
          query = query.eq('category_id', category.id);
        }
      }

      // Filter by price range
      query = query
        .gte('price', priceRange[0])
        .lte('price', priceRange[1]);

      // Filter by brands
      if (selectedBrands.length > 0) {
        query = query.in('brand', selectedBrands);
      }

      // Sort
      if (sortBy === 'price-asc') {
        query = query.order('price', { ascending: true });
      } else if (sortBy === 'price-desc') {
        query = query.order('price', { ascending: false });
      } else {
        query = query.order('created_at', { ascending: false });
      }

      const { data } = await query;
      if (data) {
        setProducts(data);
      }
    }

    if (categories.length > 0) {
      fetchProducts();
    }
  }, [selectedCategory, priceRange, selectedBrands, sortBy, categories]);

  const toggleBrand = (brand: string) => {
    setSelectedBrands((prev) =>
      prev.includes(brand)
        ? prev.filter((b) => b !== brand)
        : [...prev, brand]
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-2">PC Components</h1>
          <p className="text-slate-600">
            Showing {products.length} products
          </p>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar Filters */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg p-6 space-y-8 sticky top-20 max-h-screen overflow-y-auto">
              {/* Category Filter */}
              <div>
                <h3 className="font-semibold mb-4 text-slate-900">Categories</h3>
                <div className="space-y-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <Checkbox
                      checked={selectedCategory === ''}
                      onChange={() => setSelectedCategory('')}
                    />
                    <span className="text-sm text-slate-600">All Categories</span>
                  </label>
                  {categories.map((category) => (
                    <label key={category.id} className="flex items-center gap-2 cursor-pointer">
                      <Checkbox
                        checked={selectedCategory === category.slug}
                        onChange={() => setSelectedCategory(category.slug)}
                      />
                      <span className="text-sm text-slate-600">{category.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Filter */}
              <div>
                <h3 className="font-semibold mb-4 text-slate-900">Price Range</h3>
                <Slider
                  value={priceRange}
                  onValueChange={setPriceRange}
                  min={0}
                  max={2000}
                  step={50}
                  className="mb-4"
                />
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">${priceRange[0]}</span>
                  <span className="text-slate-600">${priceRange[1]}</span>
                </div>
              </div>

              {/* Brand Filter */}
              <div>
                <h3 className="font-semibold mb-4 text-slate-900">Brands</h3>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {brands.map((brand) => (
                    <label key={brand} className="flex items-center gap-2 cursor-pointer">
                      <Checkbox
                        checked={selectedBrands.includes(brand)}
                        onChange={() => toggleBrand(brand)}
                      />
                      <span className="text-sm text-slate-600">{brand}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Reset Filters */}
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setSelectedCategory('');
                  setPriceRange([0, 2000]);
                  setSelectedBrands([]);
                  setSortBy('newest');
                }}
              >
                Reset Filters
              </Button>
            </div>
          </div>

          {/* Products Grid */}
          <div className="lg:col-span-3">
            {/* Sort */}
            <div className="mb-6 flex justify-end">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border border-slate-300 rounded-lg text-sm bg-white"
              >
                <option value="newest">Newest</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-6 space-y-4">
                      <div className="h-48 bg-slate-200 rounded" />
                      <div className="h-4 bg-slate-200 rounded w-3/4" />
                      <div className="h-4 bg-slate-200 rounded w-1/2" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : products.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {products.map((product) => (
                  <Link key={product.id} href={`/products/${product.id}`}>
                    <Card className="overflow-hidden hover:shadow-lg transition-shadow h-full">
                      <div className="relative h-56 bg-slate-100">
                        <Image
                          src={product.image_url}
                          alt={product.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <CardContent className="p-4 space-y-3">
                        <div>
                          <p className="text-xs font-medium text-slate-500 uppercase">
                            {product.brand}
                          </p>
                          <h3 className="font-semibold text-slate-900 line-clamp-2">
                            {product.name}
                          </h3>
                        </div>
                        <div className="flex justify-between items-end">
                          <div className="text-2xl font-bold text-blue-600">
                            ${product.price.toFixed(2)}
                          </div>
                          <span
                            className={`text-xs font-medium px-2 py-1 rounded ${
                              product.stock > 0
                                ? 'bg-green-100 text-green-700'
                                : 'bg-red-100 text-red-700'
                            }`}
                          >
                            {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-slate-600 mb-4">No products found</p>
                <Button
                  onClick={() => {
                    setSelectedCategory('');
                    setPriceRange([0, 2000]);
                    setSelectedBrands([]);
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
