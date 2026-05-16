'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { createClient } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Check, Minus, Plus, ShoppingCart, Truck, Shield, RotateCcw, Heart, Share2 } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

interface Product { id: string; name: string; description: string; price: number; stock: number; image_url: string; brand: string; specs: Record<string, any>; category_id: string; }
interface Category { id: string; name: string; slug: string; }
interface RelatedProduct { id: string; name: string; price: number; image_url: string; brand: string; }

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { session } = useAuth();
  const supabase = createClient();
  const [product, setProduct] = useState<Product | null>(null);
  const [category, setCategory] = useState<Category | null>(null);
  const [related, setRelated] = useState<RelatedProduct[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);

  useEffect(() => {
    async function fetchProduct() {
      const { data } = await supabase.from('products').select('*').eq('id', params.id).single();
      if (data) {
        setProduct(data);
        const { data: catData } = await supabase.from('categories').select('*').eq('id', data.category_id).single();
        if (catData) setCategory(catData);
        const { data: relData } = await supabase.from('products').select('id, name, price, image_url, brand').eq('category_id', data.category_id).neq('id', data.id).limit(4);
        if (relData) setRelated(relData);
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
      toast.success(`${quantity} item${quantity > 1 ? 's' : ''} added to cart`);
    } catch (err) { toast.error('An error occurred'); }
    finally { setAdding(false); }
  }

  if (loading) return (
    <div className="min-h-screen bg-slate-50/40 py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-10 lg:gap-14">
          <div className="h-[440px] skeleton-shimmer rounded-2xl" />
          <div className="space-y-4"><div className="h-2.5 skeleton-shimmer rounded w-1/4" /><div className="h-7 skeleton-shimmer rounded w-3/4" /><div className="h-4 skeleton-shimmer rounded w-full" /><div className="h-4 skeleton-shimmer rounded w-2/3" /><div className="h-11 skeleton-shimmer rounded w-1/3 mt-5" /></div>
        </div>
      </div>
    </div>
  );

  if (!product) return (
    <div className="min-h-screen bg-slate-50/40 py-20"><div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center"><h1 className="text-xl font-bold mb-4">Product not found</h1><Link href="/products"><Button className="bg-blue-600 hover:bg-blue-500">Browse Products</Button></Link></div></div>
  );

  return (
    <div className="min-h-screen bg-slate-50/40">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-slate-200/60">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5">
          <nav className="flex items-center gap-1.5 text-[11px]">
            <Link href="/products" className="text-slate-500 hover:text-slate-700 transition-colors">Products</Link>
            <span className="text-slate-300">/</span>
            {category && <><Link href={`/products?category=${category.slug}`} className="text-slate-500 hover:text-slate-700 transition-colors">{category.name}</Link><span className="text-slate-300">/</span></>}
            <span className="text-slate-900 font-medium truncate max-w-[180px]">{product.name}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid md:grid-cols-2 gap-8 lg:gap-14 animate-fade-in">
          {/* Image */}
          <div className="bg-white rounded-2xl overflow-hidden border border-slate-200/70 shadow-sm">
            <div className="relative h-72 md:h-[440px] bg-slate-50">
              <Image src={product.image_url} alt={product.name} fill className="object-cover" priority sizes="(max-width: 768px) 100vw, 50vw" />
            </div>
          </div>

          {/* Details */}
          <div className="space-y-5">
            <div>
              <p className="text-[10px] font-semibold text-blue-600 uppercase tracking-wider mb-1.5">{product.brand}</p>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight leading-tight">{product.name}</h1>
            </div>
            <p className="text-slate-600 text-[13px] leading-relaxed">{product.description}</p>

            {/* Price + Stock */}
            <div className="bg-white rounded-xl p-4 border border-slate-200/70 shadow-sm space-y-4">
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-[10px] text-slate-500 mb-0.5">Price</p>
                  <span className="text-2xl font-bold text-slate-900">${product.price.toFixed(2)}</span>
                </div>
                <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold ${product.stock > 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${product.stock > 0 ? 'bg-emerald-500' : 'bg-red-500'}`} />
                  {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                </div>
              </div>

              {product.stock > 0 && (
                <>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-700 mb-1.5">Quantity</label>
                    <div className="flex items-center border border-slate-200 rounded-lg bg-white w-fit">
                      <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-2 hover:bg-slate-50 transition-colors rounded-l-lg"><Minus className="w-3.5 h-3.5" /></button>
                      <Input type="number" value={quantity} onChange={(e) => setQuantity(Math.min(product.stock, Math.max(1, parseInt(e.target.value) || 1)))} className="w-12 border-0 text-center focus:ring-0 p-0 text-sm font-medium" />
                      <button onClick={() => setQuantity(Math.min(product.stock, quantity + 1))} className="p-2 hover:bg-slate-50 transition-colors rounded-r-lg"><Plus className="w-3.5 h-3.5" /></button>
                    </div>
                  </div>
                  <div className="flex gap-2.5">
                    <Button onClick={handleAddToCart} size="lg" className="flex-1 h-11 text-sm font-semibold bg-blue-600 hover:bg-blue-500 shadow-sm shadow-blue-600/20 btn-glow" disabled={adding}>
                      <ShoppingCart className="w-4 h-4 mr-1.5" />{adding ? 'Adding...' : 'Add to Cart'}
                    </Button>
                    <Button variant="outline" size="lg" className="h-11 w-11 p-0 border-slate-200" onClick={() => { setWishlisted(!wishlisted); toast.success(wishlisted ? 'Removed from wishlist' : 'Added to wishlist'); }}>
                      <Heart className={`w-4 h-4 transition-colors ${wishlisted ? 'fill-red-500 text-red-500' : 'text-slate-400'}`} />
                    </Button>
                  </div>
                </>
              )}
            </div>

            {/* Benefits */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { icon: Truck, label: 'Free Shipping', sub: 'Orders $100+' },
                { icon: Shield, label: '2-Year Warranty', sub: 'Full coverage' },
                { icon: RotateCcw, label: '30-Day Returns', sub: 'No hassle' },
              ].map((b) => (
                <div key={b.label} className="flex flex-col items-center text-center p-2.5 bg-white rounded-xl border border-slate-200/70">
                  <b.icon className="w-4 h-4 text-blue-600 mb-1" />
                  <p className="text-[11px] font-semibold text-slate-900">{b.label}</p>
                  <p className="text-[9px] text-slate-500">{b.sub}</p>
                </div>
              ))}
            </div>

            {/* Specs */}
            {Object.keys(product.specs).length > 0 && (
              <Card className="border-slate-200/70 shadow-sm">
                <CardHeader className="pb-2 pt-4 px-4"><CardTitle className="text-sm">Specifications</CardTitle></CardHeader>
                <CardContent className="px-4 pb-4">
                  <dl className="space-y-0">
                    {Object.entries(product.specs).map(([key, value], index) => (
                      <div key={key} className={`flex justify-between py-2 text-[13px] ${index !== Object.entries(product.specs).length - 1 ? 'border-b border-slate-100' : ''}`}>
                        <dt className="text-slate-500 capitalize">{key.replace(/_/g, ' ')}</dt>
                        <dd className="text-slate-900 font-medium">{String(value)}</dd>
                      </div>
                    ))}
                  </dl>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Related Products */}
        {related.length > 0 && (
          <div className="mt-16">
            <h2 className="text-lg font-bold text-slate-900 mb-5">Related Products</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {related.map((p) => (
                <Link key={p.id} href={`/products/${p.id}`}>
                  <div className="group rounded-xl overflow-hidden border border-slate-200/70 bg-white card-hover hover:border-blue-200/60">
                    <div className="relative h-36 bg-slate-50 overflow-hidden">
                      <Image src={p.image_url} alt={p.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="25vw" />
                    </div>
                    <div className="p-3 space-y-0.5">
                      <p className="text-[9px] font-semibold text-slate-400 uppercase">{p.brand}</p>
                      <h3 className="font-medium text-slate-900 text-[12px] line-clamp-1 group-hover:text-blue-600 transition-colors">{p.name}</h3>
                      <p className="text-[13px] font-bold text-slate-900">${p.price.toFixed(2)}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
