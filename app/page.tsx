'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, Truck, Shield, Headphones, Star, ChevronRight, ShoppingCart } from 'lucide-react';

interface Product { id: string; name: string; price: number; image_url: string; stock: number; brand: string; }
interface Category { id: string; name: string; slug: string; icon: string; }

const categoryIcons: Record<string, string> = {
  'Cpu': '🔧', 'Zap': '⚡', 'Layers': '🎮', 'Database': '💾',
  'LayoutGrid': '📱', 'Wind': '🌬️', 'Box': '📦',
};

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function fetchData() {
      const [productsResult, categoriesResult] = await Promise.all([
        supabase.from('products').select('id, name, price, image_url, stock, brand').order('price', { ascending: false }).limit(8),
        supabase.from('categories').select('id, name, slug, icon').order('display_order'),
      ]);
      if (productsResult.data) setFeaturedProducts(productsResult.data);
      if (categoriesResult.data) setCategories(categoriesResult.data);
      setLoading(false);
    }
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-40" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-8 animate-slide-up">
              <div className="inline-flex items-center gap-2 bg-blue-500/20 text-blue-300 px-4 py-2 rounded-full text-sm font-medium border border-blue-500/30">
                <Star className="w-4 h-4 fill-blue-400" /> New RTX 4090 Now Available
              </div>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-[1.1] tracking-tight">
                Build Your <span className="block bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">Dream PC</span>
              </h1>
              <p className="text-lg md:text-xl text-blue-100/80 max-w-lg leading-relaxed">
                Premium components for gaming, content creation, and productivity. Expert-curated selection with fast shipping.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/products"><Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white h-12 px-8 text-base">Shop Now <ArrowRight className="w-5 h-5 ml-2" /></Button></Link>
                <Link href="/products?category=graphics-cards"><Button size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10 h-12 px-8 text-base">Browse GPUs</Button></Link>
              </div>
            </div>
            <div className="relative hidden md:block">
              <div className="relative h-[500px] rounded-2xl overflow-hidden shadow-2xl shadow-blue-500/20">
                <Image src="https://images.pexels.com/photos/30469973/pexels-photo-30469973.jpeg?auto=compress&cs=tinysrgb&w=800" alt="Gaming PC Build" fill className="object-cover" priority />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Bar */}
      <section className="bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0"><Truck className="w-6 h-6 text-blue-600" /></div>
              <div><p className="font-semibold text-slate-900">Free Shipping</p><p className="text-sm text-slate-500">On orders over $100</p></div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0"><Shield className="w-6 h-6 text-blue-600" /></div>
              <div><p className="font-semibold text-slate-900">2-Year Warranty</p><p className="text-sm text-slate-500">On all products</p></div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0"><Headphones className="w-6 h-6 text-blue-600" /></div>
              <div><p className="font-semibold text-slate-900">Expert Support</p><p className="text-sm text-slate-500">24/7 tech assistance</p></div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-12">
            <div><h2 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">Shop by Category</h2><p className="text-slate-500 mt-2">Find exactly what you need</p></div>
            <Link href="/products" className="hidden sm:flex items-center gap-1 text-blue-600 hover:text-blue-700 font-medium text-sm">View All <ChevronRight className="w-4 h-4" /></Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {categories.map((category) => (
              <Link key={category.id} href={`/products?category=${category.slug}`}>
                <Card className="group hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300 cursor-pointer border-0 bg-white hover:-translate-y-1 h-full">
                  <CardContent className="p-6 text-center space-y-3">
                    <div className="text-4xl mx-auto transform group-hover:scale-110 transition-transform duration-300">{categoryIcons[category.icon] || '📦'}</div>
                    <h3 className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">{category.name}</h3>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-12">
            <div><h2 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">Featured Products</h2><p className="text-slate-500 mt-2">Hand-picked by our experts</p></div>
            <Link href="/products" className="hidden sm:flex items-center gap-1 text-blue-600 hover:text-blue-700 font-medium text-sm">View All <ChevronRight className="w-4 h-4" /></Link>
          </div>
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (<Card key={i} className="border-0 shadow-sm"><CardContent className="p-0"><div className="h-48 bg-slate-100 animate-pulse rounded-t-lg" /><div className="p-4 space-y-3"><div className="h-3 bg-slate-100 rounded w-1/3" /><div className="h-4 bg-slate-100 rounded w-3/4" /><div className="h-6 bg-slate-100 rounded w-1/2" /></div></CardContent></Card>))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
                <Link key={product.id} href={`/products/${product.id}`}>
                  <Card className="group overflow-hidden hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 border-0 shadow-sm h-full hover:-translate-y-1">
                    <div className="relative h-48 bg-slate-50 overflow-hidden">
                      <Image src={product.image_url} alt={product.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                      {product.stock <= 5 && product.stock > 0 && <span className="absolute top-3 left-3 bg-amber-500 text-white text-[10px] font-bold px-2 py-1 rounded-md">LOW STOCK</span>}
                    </div>
                    <CardContent className="p-4 space-y-2">
                      <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">{product.brand}</p>
                      <h3 className="font-semibold text-slate-900 line-clamp-2 group-hover:text-blue-600 transition-colors leading-snug">{product.name}</h3>
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-xl font-bold text-slate-900">${product.price.toFixed(2)}</span>
                        <span className={`text-[11px] font-semibold px-2 py-1 rounded-md ${product.stock > 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>{product.stock > 0 ? 'In Stock' : 'Sold Out'}</span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
          <div className="mt-12 text-center">
            <Link href="/products"><Button size="lg" variant="outline" className="border-slate-300 text-slate-700 hover:bg-slate-50">View All Products <ArrowRight className="w-4 h-4 ml-2" /></Button></Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-br from-blue-600 to-blue-700 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight">Ready to Build Your Dream PC?</h2>
          <p className="text-blue-100 text-lg mb-8 max-w-2xl mx-auto">Browse our complete selection of premium components and get everything you need delivered to your door.</p>
          <Link href="/products"><Button size="lg" className="bg-white text-blue-700 hover:bg-blue-50 h-12 px-8 text-base font-semibold">Start Shopping <ArrowRight className="w-5 h-5 ml-2" /></Button></Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center"><ShoppingCart className="w-4 h-4 text-white" /></div>
                <span className="font-bold text-lg text-white">PC Parts</span>
              </div>
              <p className="text-sm leading-relaxed">Your one-stop shop for premium PC components and accessories.</p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Shop</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/products?category=processors" className="hover:text-white transition-colors">CPUs</Link></li>
                <li><Link href="/products?category=graphics-cards" className="hover:text-white transition-colors">GPUs</Link></li>
                <li><Link href="/products?category=memory" className="hover:text-white transition-colors">RAM</Link></li>
                <li><Link href="/products?category=storage" className="hover:text-white transition-colors">Storage</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Account</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/login" className="hover:text-white transition-colors">Sign In</Link></li>
                <li><Link href="/register" className="hover:text-white transition-colors">Register</Link></li>
                <li><Link href="/orders" className="hover:text-white transition-colors">Orders</Link></li>
                <li><Link href="/profile" className="hover:text-white transition-colors">Profile</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Support</h4>
              <ul className="space-y-2 text-sm">
                <li><span className="hover:text-white transition-colors cursor-pointer">Help Center</span></li>
                <li><span className="hover:text-white transition-colors cursor-pointer">Returns</span></li>
                <li><span className="hover:text-white transition-colors cursor-pointer">Warranty</span></li>
                <li><span className="hover:text-white transition-colors cursor-pointer">Contact Us</span></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-slate-800 text-sm text-center"><p>2024 PC Parts Store. All rights reserved.</p></div>
        </div>
      </footer>
    </div>
  );
}
