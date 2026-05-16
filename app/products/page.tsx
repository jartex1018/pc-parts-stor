'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Filter, X, ArrowUpDown, Search } from 'lucide-react';

interface Product { id: string; name: string; price: number; image_url: string; stock: number; brand: string; }
interface Category { id: string; name: string; slug: string; }

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const supabase = createClient();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>(searchParams.get('category') || '');
  const [priceRange, setPriceRange] = useState([0, 2000]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('newest');
  const [brands, setBrands] = useState<string[]>([]);

  useEffect(() => {
    async function fetchData() {
      const { data: categoriesData } = await supabase.from('categories').select('id, name, slug').order('display_order');
      if (categoriesData) setCategories(categoriesData);
      const { data: brandsData } = await supabase.from('products').select('brand').order('brand');
      if (brandsData) setBrands(Array.from(new Set(brandsData.map((p) => p.brand))) as string[]);
      setLoading(false);
    }
    fetchData();
  }, []);

  useEffect(() => {
    async function fetchProducts() {
      let query = supabase.from('products').select('*');
      if (selectedCategory) {
        const category = categories.find((c) => c.slug === selectedCategory);
        if (category) query = query.eq('category_id', category.id);
      }
      query = query.gte('price', priceRange[0]).lte('price', priceRange[1]);
      if (selectedBrands.length > 0) query = query.in('brand', selectedBrands);
      if (sortBy === 'price-asc') query = query.order('price', { ascending: true });
      else if (sortBy === 'price-desc') query = query.order('price', { ascending: false });
      else query = query.order('created_at', { ascending: false });
      const { data } = await query;
      if (data) setProducts(data);
    }
    if (categories.length > 0) fetchProducts();
  }, [selectedCategory, priceRange, selectedBrands, sortBy, categories]);

  const toggleBrand = (brand: string) => {
    setSelectedBrands((prev) => prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]);
  };

  const activeFilterCount = [selectedCategory ? 1 : 0, priceRange[0] > 0 || priceRange[1] < 2000 ? 1 : 0, selectedBrands.length > 0 ? 1 : 0].reduce((a, b) => a + b, 0);
  const clearAllFilters = () => { setSelectedCategory(''); setPriceRange([0, 2000]); setSelectedBrands([]); setSortBy('newest'); };

  return (
    <div className="min-h-screen bg-slate-50/50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
            {selectedCategory ? categories.find((c) => c.slug === selectedCategory)?.name || 'Products' : 'All Products'}
          </h1>
          <p className="text-slate-500 mt-1 text-sm">{products.length} product{products.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Toolbar */}
        <div className="flex items-center justify-between mb-6 gap-4">
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)} className="lg:hidden border-slate-200 text-slate-700">
              <Filter className="w-3.5 h-3.5 mr-1.5" />Filters
              {activeFilterCount > 0 && <Badge className="ml-1.5 bg-blue-600 text-white text-[10px] h-5 min-w-[20px] px-1.5">{activeFilterCount}</Badge>}
            </Button>
            {activeFilterCount > 0 && <button onClick={clearAllFilters} className="text-xs text-blue-600 hover:text-blue-700 font-medium">Clear all</button>}
          </div>
          <div className="flex items-center gap-2">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400">
              <option value="newest">Newest</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Active Filters */}
        {(selectedCategory || selectedBrands.length > 0) && (
          <div className="flex flex-wrap gap-2 mb-6 animate-fade-in">
            {selectedCategory && <Badge variant="secondary" className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-slate-100 text-slate-700 hover:bg-slate-200">{categories.find((c) => c.slug === selectedCategory)?.name}<button onClick={() => setSelectedCategory('')} className="ml-0.5 hover:text-slate-900"><X className="w-3 h-3" /></button></Badge>}
            {selectedBrands.map((brand) => <Badge key={brand} variant="secondary" className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-slate-100 text-slate-700 hover:bg-slate-200">{brand}<button onClick={() => toggleBrand(brand)} className="ml-0.5 hover:text-slate-900"><X className="w-3 h-3" /></button></Badge>)}
          </div>
        )}

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className={`${showFilters ? 'block' : 'hidden'} lg:block lg:col-span-1`}>
            <div className="bg-white rounded-xl p-5 space-y-7 sticky top-20 border border-slate-200/80 shadow-sm">
              <div>
                <h3 className="font-semibold text-slate-900 mb-3 text-xs uppercase tracking-wider">Categories</h3>
                <div className="space-y-0.5">
                  <button onClick={() => setSelectedCategory('')} className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${selectedCategory === '' ? 'bg-blue-50 text-blue-700 font-medium' : 'text-slate-600 hover:bg-slate-50'}`}>All Categories</button>
                  {categories.map((category) => (
                    <button key={category.id} onClick={() => setSelectedCategory(category.slug)} className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${selectedCategory === category.slug ? 'bg-blue-50 text-blue-700 font-medium' : 'text-slate-600 hover:bg-slate-50'}`}>{category.name}</button>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 mb-3 text-xs uppercase tracking-wider">Price Range</h3>
                <Slider value={priceRange} onValueChange={setPriceRange} min={0} max={2000} step={50} className="mb-3" />
                <div className="flex justify-between text-xs font-medium text-slate-600"><span>${priceRange[0]}</span><span>${priceRange[1]}</span></div>
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 mb-3 text-xs uppercase tracking-wider">Brands</h3>
                <div className="space-y-0.5 max-h-56 overflow-y-auto">
                  {brands.map((brand) => (
                    <button key={brand} onClick={() => toggleBrand(brand)} className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-2.5 ${selectedBrands.includes(brand) ? 'bg-blue-50 text-blue-700 font-medium' : 'text-slate-600 hover:bg-slate-50'}`}>
                      <div className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${selectedBrands.includes(brand) ? 'bg-blue-600 border-blue-600' : 'border-slate-300'}`}>
                        {selectedBrands.includes(brand) && <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                      </div>
                      {brand}
                    </button>
                  ))}
                </div>
              </div>
              <Button variant="outline" className="w-full border-slate-200 text-slate-600 hover:text-slate-900 text-sm" onClick={clearAllFilters}>Reset All</Button>
            </div>
          </div>

          {/* Products Grid */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="rounded-xl overflow-hidden border border-slate-100">
                    <div className="h-52 skeleton-shimmer" />
                    <div className="p-4 space-y-3">
                      <div className="h-2.5 skeleton-shimmer rounded w-1/4" />
                      <div className="h-3.5 skeleton-shimmer rounded w-3/4" />
                      <div className="h-5 skeleton-shimmer rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : products.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {products.map((product, i) => (
                  <Link key={product.id} href={`/products/${product.id}`}>
                    <div className={`group rounded-xl overflow-hidden border border-slate-200/80 bg-white hover:shadow-xl hover:shadow-slate-200/40 transition-all duration-300 h-full hover:-translate-y-1 animate-fade-in stagger-${Math.min(i + 1, 8)}`}>
                      <div className="relative h-52 bg-slate-50 overflow-hidden">
                        <Image src={product.image_url} alt={product.name} fill className="object-cover group-hover:scale-105 transition-transform duration-700" sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" />
                        {product.stock <= 5 && product.stock > 0 && <span className="absolute top-3 left-3 bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-sm">LOW STOCK</span>}
                      </div>
                      <div className="p-4 space-y-2">
                        <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">{product.brand}</p>
                        <h3 className="font-semibold text-slate-900 line-clamp-2 group-hover:text-blue-600 transition-colors text-sm leading-snug">{product.name}</h3>
                        <div className="flex items-center justify-between pt-1.5">
                          <span className="text-lg font-bold text-slate-900">${product.price.toFixed(2)}</span>
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${product.stock > 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>{product.stock > 0 ? 'In Stock' : 'Sold Out'}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-white rounded-xl border border-slate-200/80">
                <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4"><Search className="w-7 h-7 text-slate-400" /></div>
                <h3 className="text-lg font-semibold text-slate-900 mb-1">No products found</h3>
                <p className="text-slate-500 text-sm mb-6">Try adjusting your filters</p>
                <Button onClick={clearAllFilters} className="bg-blue-600 hover:bg-blue-500">Clear All Filters</Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
