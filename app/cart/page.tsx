'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trash2, ShoppingCart, ArrowLeft, Minus, Plus, Truck } from 'lucide-react';
import { toast } from 'sonner';

interface ProductInfo { id: string; name: string; price: number; image_url: string; stock: number; }
interface CartItem { id: string; product_id: string; quantity: number; products: ProductInfo; }

export default function CartPage() {
  const { session, loading: authLoading } = useAuth();
  const router = useRouter();
  const supabase = createClient();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !session) { router.push('/login'); return; }
    if (session) fetchCart();
  }, [session, authLoading]);

  async function fetchCart() {
    try {
      const { data, error } = await supabase
        .from('cart_items')
        .select('id, product_id, quantity, products(id, name, price, image_url, stock)')
        .eq('user_id', session!.user.id);

      if (error) {
        toast.error('Failed to load cart');
        setLoading(false);
        return;
      }
      if (data) setItems(data.map((d: any) => ({ ...d, products: Array.isArray(d.products) ? d.products[0] : d.products })) as CartItem[]);
    } catch (err) {
      toast.error('Something went wrong');
    }
    setLoading(false);
  }

  async function updateQuantity(cartItemId: string, newQuantity: number) {
    if (newQuantity <= 0) { removeItem(cartItemId); return; }
    setUpdating(cartItemId);
    try {
      const { error } = await supabase
        .from('cart_items')
        .update({ quantity: newQuantity })
        .eq('id', cartItemId);

      if (error) {
        toast.error('Failed to update quantity');
      } else {
        setItems((prev) => prev.map((item) => item.id === cartItemId ? { ...item, quantity: newQuantity } : item));
      }
    } catch (err) {
      toast.error('Something went wrong');
    }
    setUpdating(null);
  }

  async function removeItem(cartItemId: string) {
    try {
      const { error } = await supabase.from('cart_items').delete().eq('id', cartItemId);
      if (error) {
        toast.error('Failed to remove item');
      } else {
        setItems((prev) => prev.filter((item) => item.id !== cartItemId));
        toast.success('Item removed from cart');
      }
    } catch (err) {
      toast.error('Something went wrong');
    }
  }

  const subtotal = items.reduce((sum, item) => sum + (item.products?.price || 0) * item.quantity, 0);
  const tax = subtotal * 0.08;
  const shipping = subtotal >= 100 ? 0 : 10;
  const total = subtotal + tax + shipping;

  if (authLoading || loading) return <div className="min-h-screen bg-slate-50/40" />;

  if (items.length === 0) return (
    <div className="min-h-screen bg-slate-50/40 py-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4"><ShoppingCart className="w-7 h-7 text-slate-400" /></div>
        <h1 className="text-xl font-bold text-slate-900 mb-1.5">Your cart is empty</h1>
        <p className="text-slate-500 text-[13px] mb-6">Start shopping to add items to your cart</p>
        <Link href="/products"><Button size="lg" className="h-10 px-6 bg-blue-600 hover:bg-blue-500 text-sm btn-glow">Continue Shopping</Button></Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50/40">
      <div className="bg-white border-b border-slate-200/60">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-7">
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">Shopping Cart</h1>
          <p className="text-slate-500 mt-0.5 text-[13px]">{items.length} item{items.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-7">
        <Link href="/products" className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 font-medium text-[13px] mb-5"><ArrowLeft className="w-3.5 h-3.5" />Continue Shopping</Link>

        <div className="grid lg:grid-cols-3 gap-7">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200/70 overflow-hidden">
              {items.map((item) => (
                <div key={item.id} className="flex gap-3.5 sm:gap-4 p-4 border-b border-slate-100 last:border-0 animate-fade-in">
                  {item.products && (
                    <Link href={`/products/${item.products.id}`} className="relative w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0 bg-slate-50 rounded-xl overflow-hidden border border-slate-100">
                      <Image src={item.products.image_url} alt={item.products.name} fill className="object-cover" sizes="80px" />
                    </Link>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between gap-2">
                      <div>
                        <Link href={`/products/${item.products?.id || '#'}`}>
                          <h3 className="font-semibold text-slate-900 hover:text-blue-600 transition-colors text-[13px] leading-snug line-clamp-2">{item.products?.name || 'Product'}</h3>
                        </Link>
                        <p className="text-[11px] text-slate-500 mt-0.5">${(item.products?.price || 0).toFixed(2)} each</p>
                      </div>
                      <p className="text-sm font-bold text-slate-900 flex-shrink-0">${((item.products?.price || 0) * item.quantity).toFixed(2)}</p>
                    </div>
                    <div className="flex items-center justify-between mt-2.5">
                      <div className="flex items-center border border-slate-200 rounded-lg bg-white">
                        <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="p-1.5 hover:bg-slate-50 transition-colors rounded-l-lg" disabled={updating === item.id}><Minus className="w-3 h-3" /></button>
                        <span className="px-2.5 text-[13px] font-medium min-w-[1.75rem] text-center">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, Math.min(item.products?.stock || 99, item.quantity + 1))} className="p-1.5 hover:bg-slate-50 transition-colors rounded-r-lg" disabled={updating === item.id}><Plus className="w-3 h-3" /></button>
                      </div>
                      <button onClick={() => removeItem(item.id)} className="text-slate-400 hover:text-red-600 transition-colors p-1 hover:bg-red-50 rounded-lg"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-1">
            <Card className="border-slate-200/70 shadow-sm sticky top-[72px]">
              <CardHeader className="pb-2 pt-4 px-4"><CardTitle className="text-sm">Order Summary</CardTitle></CardHeader>
              <CardContent className="px-4 pb-4 space-y-3.5">
                <div className="space-y-2">
                  <div className="flex justify-between text-[13px]"><span className="text-slate-500">Subtotal</span><span className="font-medium">${subtotal.toFixed(2)}</span></div>
                  <div className="flex justify-between text-[13px]"><span className="text-slate-500">Tax (8%)</span><span className="font-medium">${tax.toFixed(2)}</span></div>
                  <div className="flex justify-between text-[13px]"><span className="text-slate-500">Shipping</span><span className="font-medium">{shipping === 0 ? <span className="text-emerald-600">Free</span> : `$${shipping.toFixed(2)}`}</span></div>
                </div>
                <div className="pt-3 border-t border-slate-100">
                  <div className="flex justify-between items-center mb-4"><span className="font-semibold text-slate-900 text-sm">Total</span><span className="text-lg font-bold text-slate-900">${total.toFixed(2)}</span></div>
                  <Link href="/checkout"><Button className="w-full h-10 text-sm font-semibold bg-blue-600 hover:bg-blue-500 shadow-sm shadow-blue-600/20 btn-glow">Proceed to Checkout</Button></Link>
                </div>
                {shipping > 0 && (
                  <div className="flex items-start gap-2 bg-blue-50 rounded-lg p-2.5"><Truck className="w-3.5 h-3.5 text-blue-600 flex-shrink-0 mt-0.5" /><p className="text-[11px] text-blue-700">Add ${(100 - subtotal).toFixed(2)} more for free shipping!</p></div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
