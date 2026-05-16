'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { ArrowRight, Truck, Shield, Headphones, Star, ChevronRight, ShoppingCart, Cpu, Monitor, MemoryStick, HardDrive, Box, Wind, Zap, Layers } from 'lucide-react';

interface Product { id: string; name: string; price: number; image_url: string; stock: number; brand: string; }
interface Category { id: string; name: string; slug: string; icon: string; }

const categoryConfig: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  'Cpu': { icon: Cpu, color: 'text-blue-600', bg: 'from-blue-500 to-blue-600' },
  'Zap': { icon: Monitor, color: 'text-emerald-600', bg: 'from-emerald-500 to-emerald-600' },
  'Layers': { icon: Monitor, color: 'text-rose-600', bg: 'from-rose-500 to-rose-600' },
  'Database': { icon: HardDrive, color: 'text-amber-600', bg: 'from-amber-500 to-amber-600' },
  'LayoutGrid': { icon: Layers, color: 'text-teal-600', bg: 'from-teal-500 to-teal-600' },
  'Wind': { icon: Wind, color: 'text-cyan-600', bg: 'from-cyan-500 to-cyan-600' },
  'Box': { icon: Box, color: 'text-slate-600', bg: 'from-slate-500 to-slate-600' },
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
      <section className="relative overflow-hidden bg-slate-950">
        <div className="absolute inset-0">
          <Image src="https://images.pexels.com/photos/30469973/pexels-photo-30469973.jpeg?auto=compress&cs=tinysrgb&w=1200" alt="" fill className="object-cover opacity-25" priority sizes="100vw" />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/95 to-slate-950/50" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(59,130,246,0.08),transparent_60%)]" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-40">
          <div className="max-w-2xl space-y-7 animate-slide-up">
            <div className="inline-flex items-center gap-2 bg-blue-500/10 text-blue-400 px-3.5 py-1.5 rounded-full text-xs font-semibold border border-blue-500/15">
              <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-glow-pulse" />
              New RTX 4090 Now Available
            </div>
            <h1 className="text-5xl md:text-6xl lg:text-[4.25rem] font-bold text-white leading-[1.05] tracking-tight">
              Build Your<br />
              <span className="gradient-text animate-gradient">Dream PC</span>
            </h1>
            <p className="text-base md:text-lg text-slate-400 max-w-md leading-relaxed">
              Premium components for gaming, content creation, and productivity. Expert-curated with fast, free shipping.
            </p>
            <div className="flex flex-wrap gap-3 pt-1">
              <Link href="/products">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-500 text-white h-11 px-7 text-sm font-semibold shadow-lg shadow-blue-600/25 transition-all hover:shadow-blue-600/40 btn-glow">
                  Shop Now <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
              <Link href="/products?category=graphics-cards">
                <Button size="lg" variant="outline" className="border-slate-700/60 text-slate-300 hover:bg-slate-800/50 hover:text-white hover:border-slate-600 h-11 px-7 text-sm">
                  Browse GPUs
                </Button>
              </Link>
            </div>
            <div className="flex items-center gap-5 pt-3 text-[13px] text-slate-500">
              <div className="flex items-center gap-1.5"><Truck className="w-4 h-4 text-blue-500" /> Free Shipping</div>
              <div className="flex items-center gap-1.5"><Shield className="w-4 h-4 text-blue-500" /> 2-Year Warranty</div>
              <div className="flex items-center gap-1.5"><Headphones className="w-4 h-4 text-blue-500" /> 24/7 Support</div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Bar */}
      <section className="bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-100">
            {[
              { icon: Truck, title: 'Free Shipping', desc: 'On orders over $100' },
              { icon: Shield, title: '2-Year Warranty', desc: 'On all products' },
              { icon: Headphones, title: 'Expert Support', desc: '24/7 tech assistance' },
            ].map((item) => (
              <div key={item.title} className="flex items-center gap-3.5 py-4 px-4 md:px-5">
                <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <item.icon className="w-4.5 h-4.5 text-blue-600" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900 text-[13px]">{item.title}</p>
                  <p className="text-[11px] text-slate-500">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 bg-slate-50/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">Shop by Category</h2>
              <p className="text-slate-500 mt-0.5 text-[13px]">Find exactly what you need</p>
            </div>
            <Link href="/products" className="hidden sm:flex items-center gap-1 text-blue-600 hover:text-blue-700 font-medium text-[13px]">
              View All <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {categories.map((category, i) => {
              const config = categoryConfig[category.icon] || { icon: ShoppingCart, color: 'text-slate-600', bg: 'from-slate-500 to-slate-600' };
              const Icon = config.icon;
              return (
                <Link key={category.id} href={`/products?category=${category.slug}`}>
                  <div className={`group relative overflow-hidden rounded-xl bg-white border border-slate-200/70 p-5 card-hover hover:border-blue-200/60 animate-fade-in stagger-${Math.min(i + 1, 8)}`}>
                    <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${config.bg} flex items-center justify-center text-white mb-3 group-hover:scale-110 transition-transform duration-300 shadow-sm`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="font-semibold text-slate-900 text-[13px] group-hover:text-blue-600 transition-colors">{category.name}</h3>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">Featured Products</h2>
              <p className="text-slate-500 mt-0.5 text-[13px]">Hand-picked by our experts</p>
            </div>
            <Link href="/products" className="hidden sm:flex items-center gap-1 text-blue-600 hover:text-blue-700 font-medium text-[13px]">
              View All <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="rounded-xl overflow-hidden border border-slate-100">
                  <div className="h-48 skeleton-shimmer" />
                  <div className="p-3.5 space-y-2.5">
                    <div className="h-2 skeleton-shimmer rounded w-1/4" />
                    <div className="h-3.5 skeleton-shimmer rounded w-3/4" />
                    <div className="h-5 skeleton-shimmer rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {featuredProducts.map((product, i) => (
                <Link key={product.id} href={`/products/${product.id}`}>
                  <div className={`group rounded-xl overflow-hidden border border-slate-200/70 bg-white card-hover hover:border-blue-200/60 h-full animate-fade-in stagger-${Math.min(i + 1, 8)}`}>
                    <div className="relative h-48 bg-slate-50 overflow-hidden">
                      <Image src={product.image_url} alt={product.name} fill className="object-cover group-hover:scale-105 transition-transform duration-700" sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw" />
                      {product.stock <= 5 && product.stock > 0 && (
                        <span className="absolute top-2.5 left-2.5 bg-amber-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md shadow-sm">LOW STOCK</span>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                    <div className="p-3.5 space-y-1.5">
                      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{product.brand}</p>
                      <h3 className="font-semibold text-slate-900 line-clamp-2 group-hover:text-blue-600 transition-colors text-[13px] leading-snug">{product.name}</h3>
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-base font-bold text-slate-900">${product.price.toFixed(2)}</span>
                        <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-md ${product.stock > 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                          {product.stock > 0 ? 'In Stock' : 'Sold Out'}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
          <div className="mt-10 text-center">
            <Link href="/products">
              <Button size="lg" variant="outline" className="border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 h-10 px-6 text-sm">
                View All Products <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden bg-slate-900">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/15 to-cyan-600/10" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_50%,rgba(59,130,246,0.12),transparent_60%)]" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-3 tracking-tight">Ready to Build Your Dream PC?</h2>
          <p className="text-slate-400 text-base mb-7 max-w-2xl mx-auto leading-relaxed">
            Browse our complete selection of premium components and get everything you need delivered to your door.
          </p>
          <Link href="/products">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-500 text-white h-11 px-7 text-sm font-semibold shadow-lg shadow-blue-600/25 btn-glow">
              Start Shopping <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 text-slate-500 py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-7 mb-10">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center shadow-sm shadow-blue-600/20"><ShoppingCart className="w-3.5 h-3.5 text-white" /></div>
                <span className="font-bold text-base text-white">PC Parts</span>
              </div>
              <p className="text-xs leading-relaxed text-slate-600">Your one-stop shop for premium PC components and accessories.</p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-3 text-xs uppercase tracking-wider">Shop</h4>
              <ul className="space-y-2 text-xs">
                <li><Link href="/products?category=processors" className="hover:text-white transition-colors">CPUs</Link></li>
                <li><Link href="/products?category=graphics-cards" className="hover:text-white transition-colors">GPUs</Link></li>
                <li><Link href="/products?category=memory" className="hover:text-white transition-colors">RAM</Link></li>
                <li><Link href="/products?category=storage" className="hover:text-white transition-colors">Storage</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-3 text-xs uppercase tracking-wider">Account</h4>
              <ul className="space-y-2 text-xs">
                <li><Link href="/login" className="hover:text-white transition-colors">Sign In</Link></li>
                <li><Link href="/register" className="hover:text-white transition-colors">Register</Link></li>
                <li><Link href="/orders" className="hover:text-white transition-colors">Orders</Link></li>
                <li><Link href="/profile" className="hover:text-white transition-colors">Profile</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-3 text-xs uppercase tracking-wider">Support</h4>
              <ul className="space-y-2 text-xs">
                <li><span className="hover:text-white transition-colors cursor-pointer">Help Center</span></li>
                <li><span className="hover:text-white transition-colors cursor-pointer">Returns</span></li>
                <li><span className="hover:text-white transition-colors cursor-pointer">Warranty</span></li>
                <li><span className="hover:text-white transition-colors cursor-pointer">Contact Us</span></li>
              </ul>
            </div>
          </div>
          <div className="pt-7 border-t border-slate-800/40 text-[11px] text-slate-700 text-center">
            2024 PC Parts Store. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
