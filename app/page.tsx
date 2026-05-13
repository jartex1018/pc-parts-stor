'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, Zap, Database, Wind, Box } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  price: number;
  image_url: string;
  stock: number;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
}

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function fetchData() {
      const [productsResult, categoriesResult] = await Promise.all([
        supabase
          .from('products')
          .select('id, name, price, image_url, stock')
          .limit(6),
        supabase
          .from('categories')
          .select('id, name, slug, icon')
          .order('display_order'),
      ]);

      if (productsResult.data) {
        setFeaturedProducts(productsResult.data);
      }
      if (categoriesResult.data) {
        setCategories(categoriesResult.data);
      }
      setLoading(false);
    }

    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h1 className="text-5xl md:text-6xl font-bold leading-tight">
                Build Your Ultimate PC
              </h1>
              <p className="text-xl text-blue-100">
                Premium PC components for gaming, content creation, and productivity. Fast shipping and expert support.
              </p>
              <div className="flex gap-4">
                <Link href="/products">
                  <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50">
                    Shop Now
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
              </div>
            </div>
            <div className="relative h-96 rounded-lg overflow-hidden shadow-2xl">
              <Image
                src="https://images.pexels.com/photos/18105/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=800"
                alt="Gaming PC Build"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold mb-12">Shop by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.map((category) => (
              <Link key={category.id} href={`/products?category=${category.slug}`}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                  <CardContent className="p-6 text-center space-y-3">
                    <div className="text-4xl">{getCategoryIcon(category.icon)}</div>
                    <h3 className="font-semibold text-slate-900">{category.name}</h3>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold mb-12">Featured Products</h2>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {featuredProducts.map((product) => (
                <Link key={product.id} href={`/products/${product.id}`}>
                  <Card className="overflow-hidden hover:shadow-lg transition-shadow h-full">
                    <div className="relative h-48 bg-slate-100 overflow-hidden">
                      <Image
                        src={product.image_url}
                        alt={product.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <CardContent className="p-4 space-y-3">
                      <h3 className="font-semibold text-slate-900 line-clamp-2">{product.name}</h3>
                      <div className="flex justify-between items-end">
                        <div className="text-2xl font-bold text-blue-600">
                          ${product.price.toFixed(2)}
                        </div>
                        <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2 py-1 rounded">
                          {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold mb-12 text-center">Why Shop With Us</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-0 shadow-md">
              <CardContent className="p-8 text-center space-y-4">
                <Zap className="w-12 h-12 text-blue-600 mx-auto" />
                <h3 className="text-xl font-semibold">Fast Shipping</h3>
                <p className="text-slate-600">Get your parts delivered quickly with reliable tracking</p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-md">
              <CardContent className="p-8 text-center space-y-4">
                <Database className="w-12 h-12 text-blue-600 mx-auto" />
                <h3 className="text-xl font-semibold">Huge Selection</h3>
                <p className="text-slate-600">Browse the latest CPUs, GPUs, RAM, and more</p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-md">
              <CardContent className="p-8 text-center space-y-4">
                <Wind className="w-12 h-12 text-blue-600 mx-auto" />
                <h3 className="text-xl font-semibold">Expert Support</h3>
                <p className="text-slate-600">Our team is here to help with compatibility questions</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}

function getCategoryIcon(iconName: string): string {
  const icons: Record<string, string> = {
    'Cpu': '🔧',
    'Zap': '⚡',
    'Layers': '🎮',
    'Database': '💾',
    'LayoutGrid': '📱',
    'Wind': '🌬️',
    'Box': '📦',
  };
  return icons[iconName] || '📦';
}
