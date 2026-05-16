'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { ArrowRight, Truck, Shield, Headphones, Star, ChevronRight, ShoppingCart, Cpu, Monitor, MemoryStick, HardDrive, Box, Wind, Layers, Sparkles } from 'lucide-react';

interface Product { id: string; name: string; price: number; image_url: string; stock: number; brand: string; }
interface Category { id: string; name: string; slug: string; icon: string; }

const categoryConfig: Record<string, { icon: React.ElementType; gradient: string }> = {
  'Cpu': { icon: Cpu, gradient: 'from-blue-600 to-blue-500' },
  'Zap': { icon: Monitor, gradient: 'from-emerald-600 to-emerald-500' },
  'Layers': { icon: Monitor, gradient: 'from-rose-600 to-rose-500' },
  'Database': { icon: HardDrive, gradient: 'from-amber-600 to-amber-500' },
  'LayoutGrid': { icon: Layers, gradient: 'from-teal-600 to-teal-500' },
  'Wind': { icon: Wind, gradient: 'from-cyan-600 to-cyan-500' },
  'Box': { icon: Box, gradient: 'from-slate-600 to-slate-500' },
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
      {/* Premium Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 min-h-[600px] md:min-h-[700px]">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <Image src="https://images.pexels.com/photos/30469973/pexels-photo-30469973.jpeg?auto=compress&cs=tinysrgb&w=1200" alt="" fill className="object-cover opacity-20" priority sizes="100vw" />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/90 to-slate-950/40" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(59,130,246,0.15),transparent_70%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(6,182,212,0.08),transparent_50%)]" />
        </div>

        {/* Floating elements */}
        <div className="absolute top-20 right-20 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-40 left-10 w-40 h-40 bg-cyan-500/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-40">
          <div className="max-w-3xl space-y-8 animate-slide-up">
            {/* Badge */}
            <div className="inline-flex items-center gap-2.5 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 text-blue-300 px-4 py-2 rounded-full text-xs font-semibold border border-blue-500/20 backdrop-blur-sm">
              <div className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-blue-400 animate-bounce-in" />
                <span>New RTX 4090 Available • Free Shipping on All Orders</span>
              </div>
            </div>

            {/* Main Heading */}
            <div className="space-y-4">
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white leading-[1.05] tracking-tight">
                Build Your
                <br />
                <span className="gradient-text animate-gradient bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-400 bg-clip-text">
                  Dream PC
                </span>
              </h1>
              <p className="text-lg md:text-xl text-slate-300 max-w-lg leading-relaxed font-light">
                Premium components for gaming, content creation, and productivity. Expertly curated with 24/7 support and satisfaction guaranteed.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <Link href="/products" className="group">
                <Button size="lg" className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white h-12 px-8 text-sm font-bold shadow-lg shadow-blue-600/40 transition-all duration-300 hover:shadow-blue-600/60 btn-glow group-hover:scale-105">
                  Shop Now <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/products?category=graphics-cards" className="group">
                <Button size="lg" variant="outline" className="w-full sm:w-auto border-2 border-slate-700 text-slate-200 hover:bg-slate-800/50 hover:border-slate-600 hover:text-white h-12 px-8 text-sm font-bold transition-all duration-300 group-hover:scale-105">
                  Browse GPUs <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap gap-6 pt-6 text-sm">
              {[
                { icon: Truck, label: 'Free Shipping', desc: 'On $100+' },
                { icon: Shield, label: '2-Year Warranty', desc: 'Full coverage' },
                { icon: Headphones, label: '24/7 Support', desc: 'Expert help' },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-2.5">
                  <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                    <item.icon className="w-4 h-4 text-blue-300" />
                  </div>
                  <div>
                    <p className="font-semibold text-white text-xs">{item.label}</p>
                    <p className="text-slate-400 text-[10px]">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Premium Trust Bar */}
      <section className="bg-white border-b-2 border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x-2 divide-slate-200">
            {[
              { icon: Truck, title: 'Free Shipping', desc: 'On orders over $100' },
              { icon: Shield, title: '2-Year Warranty', desc: 'Comprehensive coverage' },
              { icon: Headphones, title: 'Expert Support', desc: '24/7 tech assistance' },
            ].map((item) => (
              <div key={item.title} className="flex items-center gap-4 py-5 px-6 hover:bg-slate-50/50 transition-colors duration-300">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm shadow-blue-600/20">
                  <item.icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-bold text-slate-900 text-sm">{item.title}</p>
                  <p className="text-[12px] text-slate-500 mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-20 bg-gradient-to-b from-white to-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <div className="flex items-end justify-between">
              <div>
                <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">Shop by Category</h2>
                <p className="text-slate-500 mt-2 text-sm font-medium">Browse our premium selection</p>
              </div>
              <Link href="/products" className="hidden sm:flex items-center gap-2 text-blue-600 hover:text-blue-700 font-bold text-sm transition-colors">
                View All <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {categories.map((category, i) => {
              const config = categoryConfig[category.icon] || { icon: Box, gradient: 'from-slate-600 to-slate-500' };
              const Icon = config.icon;
              return (
                <Link key={category.id} href={`/products?category=${category.slug}`}>
                  <div className={`group relative overflow-hidden rounded-2xl bg-white border-2 border-slate-200 p-6 card-hover hover:border-blue-300/50 animate-fade-in stagger-${Math.min(i + 1, 8)}`}>
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${config.gradient} flex items-center justify-center text-white mb-4 group-hover:scale-125 transition-transform duration-300 shadow-sm shadow-blue-600/20`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="font-bold text-slate-900 text-sm group-hover:text-blue-600 transition-colors">{category.name}</h3>
                    <p className="text-[11px] text-slate-400 mt-1">Premium components</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">Featured Products</h2>
              <p className="text-slate-500 mt-2 text-sm font-medium">Bestselling components</p>
            </div>
            <Link href="/products" className="hidden sm:flex items-center gap-2 text-blue-600 hover:text-blue-700 font-bold text-sm transition-colors">
              View All <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="rounded-xl overflow-hidden border-2 border-slate-200">
                  <div className="h-52 skeleton-shimmer" />
                  <div className="p-4 space-y-3"><div className="h-2.5 skeleton-shimmer rounded w-1/4" /><div className="h-4 skeleton-shimmer rounded w-3/4" /><div className="h-5 skeleton-shimmer rounded w-1/2" /></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {featuredProducts.map((product, i) => (
                <Link key={product.id} href={`/products/${product.id}`}>
                  <div className={`group rounded-2xl overflow-hidden border-2 border-slate-200 bg-white card-hover hover:border-blue-300 h-full animate-fade-in stagger-${Math.min(i + 1, 8)}`}>
                    <div className="relative h-52 bg-gradient-to-br from-slate-50 to-slate-100 overflow-hidden">
                      <Image src={product.image_url} alt={product.name} fill className="object-cover group-hover:scale-110 transition-transform duration-700" sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw" />
                      {product.stock <= 5 && product.stock > 0 && (
                        <span className="absolute top-3 right-3 bg-amber-500 text-white text-[9px] font-black px-2 py-1 rounded-lg shadow-lg">LOW STOCK</span>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                    <div className="p-4 space-y-2.5">
                      <p className="text-[10px] font-black text-blue-600 uppercase tracking-wider">{product.brand}</p>
                      <h3 className="font-bold text-slate-900 line-clamp-2 group-hover:text-blue-600 transition-colors text-[13px] leading-snug">{product.name}</h3>
                      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                        <span className="text-lg font-black bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">${product.price.toFixed(2)}</span>
                        <span className={`text-[9px] font-black px-2 py-1 rounded-lg text-white ${product.stock > 0 ? 'bg-emerald-600' : 'bg-red-600'}`}>
                          {product.stock > 0 ? 'In Stock' : 'Sold Out'}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
          <div className="mt-12 text-center">
            <Link href="/products">
              <Button size="lg" variant="outline" className="h-12 px-8 text-sm font-bold border-2 border-slate-300 hover:border-blue-600 text-slate-700 hover:text-blue-600 transition-all duration-300 hover:scale-105">
                View All Products <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Premium CTA */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-slate-900 py-20">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-10 right-20 w-40 h-40 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-60 h-60 bg-white/3 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-black text-white mb-6 tracking-tight">Ready to Build?</h2>
          <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto leading-relaxed font-light">
            Join thousands of gamers and creators who trust us for their PC components.
          </p>
          <Link href="/products">
            <Button size="lg" className="h-12 px-8 text-sm font-bold bg-white text-blue-700 hover:bg-slate-100 shadow-xl shadow-blue-600/40 transition-all duration-300 hover:scale-105 btn-glow">
              Start Building <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Premium Footer */}
      <footer className="bg-slate-950 text-slate-400 py-16 border-t-2 border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-12">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-500 rounded-lg flex items-center justify-center">
                  <ShoppingCart className="w-4 h-4 text-white" />
                </div>
                <span className="font-black text-lg text-white">PC Parts</span>
              </div>
              <p className="text-sm leading-relaxed text-slate-500">Premium PC components and accessories for gamers, creators, and professionals worldwide.</p>
            </div>
            {[
              { title: 'Shop', links: [['CPUs', '/products?category=processors'], ['GPUs', '/products?category=graphics-cards'], ['RAM', '/products?category=memory'], ['Storage', '/products?category=storage']] },
              { title: 'Account', links: [['Sign In', '/login'], ['Register', '/register'], ['Orders', '/orders'], ['Profile', '/profile']] },
              { title: 'Support', links: [['Help', '#'], ['Returns', '#'], ['Warranty', '#'], ['Contact', '#']] },
            ].map((section) => (
              <div key={section.title}>
                <h4 className="font-bold text-white mb-4 text-sm">{section.title}</h4>
                <ul className="space-y-2.5 text-sm">
                  {section.links.map(([label, href]) => (
                    <li key={label}><Link href={href} className="hover:text-white transition-colors duration-200">{label}</Link></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="pt-8 border-t border-slate-800/50 text-center text-xs text-slate-600">
            <p>© 2024 PC Parts Store. All rights reserved. | Premium PC Components & Support</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
