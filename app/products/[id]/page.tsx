'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { createClient } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Check, Minus, Plus, ShoppingCart, Truck, Shield, RotateCcw } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

interface Product { id: string; name: string; description: string; price: number; stock: number; image_url: string; brand: string; specs: Record<string, any>; category_id: string; }
interface Category { id: string; name: string; slug: string; }

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { session } = useAuth();
  const supabase = createClient();
  const [product, setProduct] = useState<Product | null>(null);
  const [category, setCategory] = useState<Category | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    async function fetchProduct() {
      const { data } = await supabase.from('products').select('*').eq('id', params.id).single();
      if (data) {
        setProduct(data);
        const { data: catData } = await supabase.from('categories').select('*').eq('id', data.category_id).single();
        if (catData) setCategory(catData);
      }
      setLoading(false);
    }
    if (params.id) fetchProduct();
  }, [params.id]);

  async function handleAddToCart() {
    if (!session) { toast.error('Please log in to add items to cart'); router.push('/login'); return; }
    if (!product) return;
    setAdding(true);
    try {
      const { data: existing } = await supabase.from('cart_items').select('id, quantity').eq('user_id', session.user.id).eq('product_id', product.id).maybeSingle();
      if (existing) {
        const { error } = await supabase.from('cart_items').update({ quantity: existing.quantity + quantity }).eq('id', existing.id);
        if (error) { toast.error('Failed to update cart'); return; }
      } else {
        const { error } = await supabase.from('cart_items').insert({ user_id: session.user.id, product_id: product.id, quantity });
        if (error) { toast.error('Failed to add to cart'); return; }
      }
      toast.success('Added to cart!');
    } catch (err) { toast.error('An error occurred'); }
    finally { setAdding(false); }
  }

  if (loading) return (<div className="min-h-screen bg-slate-50 py-12"><div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8"><div className="bg-white rounded-xl p-8 space-y-6 animate-pulse"><div className="h-4 bg-slate-100 rounded w-1/4" /><div className="grid md:grid-cols-2 gap-12"><div className="h-96 bg-slate-100 rounded-xl" /><div className="space-y-4"><div className="h-4 bg-slate-100 rounded w-1/4" /><div className="h-8 bg-slate-100 rounded w-3/4" /><div className="h-6 bg-slate-100 rounded w-1/2" /></div></div></div></div></div>);

  if (!product) return (<div className="min-h-screen bg-slate-50 py-20"><div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center"><h1 className="text-2xl font-bold mb-4">Product not found</h1><Link href="/products"><Button>Browse Products</Button></Link></div></div>);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex items-center gap-2 text-sm">
            <Link href="/products" className="text-slate-500 hover:text-slate-700 transition-colors">Products</Link>
            <span className="text-slate-300">/</span>
            {category && <><Link href={`/products?category=${category.slug}`} className="text-slate-500 hover:text-slate-700 transition-colors">{category.name}</Link><span className="text-slate-300">/</span></>}
            <span className="text-slate-900 font-medium truncate">{product.name}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid md:grid-cols-2 gap-10 lg:gap-16">
          <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-200">
            <div className="relative h-80 md:h-[480px]">
              <Image src={product.image_url} alt={product.name} fill className="object-cover" priority />
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <p className="text-sm font-semibold text-blue-600 uppercase tracking-wider mb-2">{product.brand}</p>
              <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight mb-4">{product.name}</h1>
              <p className="text-slate-600 leading-relaxed text-lg">{product.description}</p>
            </div>

            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm space-y-5">
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-sm text-slate-500 mb-1">Price</p>
                  <span className="text-4xl font-bold text-slate-900">${product.price.toFixed(2)}</span>
                </div>
                <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${product.stock > 0 ? 'bg-emerald-50' : 'bg-red-50'}`}>
                  <Check className={`w-4 h-4 ${product.stock > 0 ? 'text-emerald-600' : 'text-red-600'}`} />
                  <span className={`text-sm font-semibold ${product.stock > 0 ? 'text-emerald-700' : 'text-red-700'}`}>{product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}</span>
                </div>
              </div>

              {product.stock > 0 && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-3">Quantity</label>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center border border-slate-200 rounded-lg bg-white">
                        <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-3 hover:bg-slate-50 transition-colors rounded-l-lg"><Minus className="w-4 h-4" /></button>
                        <Input type="number" value={quantity} onChange={(e) => setQuantity(Math.min(product.stock, Math.max(1, parseInt(e.target.value) || 1)))} className="w-16 border-0 text-center focus:ring-0 p-0 text-base font-medium" />
                        <button onClick={() => setQuantity(Math.min(product.stock, quantity + 1))} className="p-3 hover:bg-slate-50 transition-colors rounded-r-lg"><Plus className="w-4 h-4" /></button>
                      </div>
                    </div>
                  </div>
                  <Button onClick={handleAddToCart} size="lg" className="w-full h-12 text-base font-semibold" disabled={adding}>
                    <ShoppingCart className="w-5 h-5 mr-2" />{adding ? 'Adding...' : 'Add to Cart'}
                  </Button>
                </>
              )}
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="flex flex-col items-center text-center p-3 bg-white rounded-xl border border-slate-200"><Truck className="w-5 h-5 text-blue-600 mb-2" /><p className="text-xs font-medium text-slate-700">Free Shipping</p></div>
              <div className="flex flex-col items-center text-center p-3 bg-white rounded-xl border border-slate-200"><Shield className="w-5 h-5 text-blue-600 mb-2" /><p className="text-xs font-medium text-slate-700">2-Year Warranty</p></div>
              <div className="flex flex-col items-center text-center p-3 bg-white rounded-xl border border-slate-200"><RotateCcw className="w-5 h-5 text-blue-600 mb-2" /><p className="text-xs font-medium text-slate-700">30-Day Returns</p></div>
            </div>

            {Object.keys(product.specs).length > 0 && (
              <Card className="border-slate-200 shadow-sm">
                <CardHeader className="pb-4"><CardTitle className="text-lg">Specifications</CardTitle></CardHeader>
                <CardContent>
                  <dl className="space-y-0">
                    {Object.entries(product.specs).map(([key, value], index) => (
                      <div key={key} className={`flex justify-between py-3 ${index !== Object.entries(product.specs).length - 1 ? 'border-b border-slate-100' : ''}`}>
                        <dt className="font-medium text-slate-500 capitalize text-sm">{key.replace(/_/g, ' ')}</dt>
                        <dd className="text-slate-900 font-medium text-sm">{String(value)}</dd>
                      </div>
                    ))}
                  </dl>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
