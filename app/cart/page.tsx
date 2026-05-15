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

interface CartItem { id: string; product_id: string; quantity: number; products: { id: string; name: string; price: number; image_url: string; stock: number; }; }

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
    const { data } = await supabase.from('cart_items').select('*, products(id, name, price, image_url, stock)').eq('user_id', session!.user.id);
    if (data) setItems(data as CartItem[]);
    setLoading(false);
  }

  async function updateQuantity(cartItemId: string, newQuantity: number) {
    if (newQuantity <= 0) { removeItem(cartItemId); return; }
    setUpdating(cartItemId);
    const { error } = await supabase.from('cart_items').update({ quantity: newQuantity }).eq('id', cartItemId);
    if (!error) setItems((prev) => prev.map((item) => item.id === cartItemId ? { ...item, quantity: newQuantity } : item));
    setUpdating(null);
  }

  async function removeItem(cartItemId: string) {
    const { error } = await supabase.from('cart_items').delete().eq('id', cartItemId);
    if (!error) { setItems((prev) => prev.filter((item) => item.id !== cartItemId)); toast.success('Item removed from cart'); }
  }

  const subtotal = items.reduce((sum, item) => sum + item.products.price * item.quantity, 0);
  const tax = subtotal * 0.08;
  const shipping = subtotal >= 100 ? 0 : 10;
  const total = subtotal + tax + shipping;

  if (authLoading || loading) return <div className="min-h-screen bg-slate-50 py-12" />;

  if (items.length === 0) return (
    <div className="min-h-screen bg-slate-50 py-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6"><ShoppingCart className="w-10 h-10 text-slate-400" /></div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Your cart is empty</h1>
        <p className="text-slate-500 mb-8">Start shopping to add items to your cart</p>
        <Link href="/products"><Button size="lg" className="h-12 px-8">Continue Shopping</Button></Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">Shopping Cart</h1>
          <p className="text-slate-500 mt-2">{items.length} item{items.length !== 1 ? 's' : ''} in your cart</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <Link href="/products" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium text-sm mb-2"><ArrowLeft className="w-4 h-4" />Continue Shopping</Link>
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              {items.map((item) => (
                <div key={item.id} className="flex gap-4 sm:gap-6 p-4 sm:p-6 border-b border-slate-100 last:border-0">
                  <Link href={`/products/${item.products.id}`} className="relative w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0 bg-slate-50 rounded-xl overflow-hidden">
                    <Image src={item.products.image_url} alt={item.products.name} fill className="object-cover" />
                  </Link>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between gap-4">
                      <div>
                        <Link href={`/products/${item.products.id}`}><h3 className="font-semibold text-slate-900 hover:text-blue-600 transition-colors line-clamp-2 leading-snug">{item.products.name}</h3></Link>
                        <p className="text-sm text-slate-500 mt-1">${item.products.price.toFixed(2)} each</p>
                      </div>
                      <div className="text-right flex-shrink-0"><p className="text-lg font-bold text-slate-900">${(item.products.price * item.quantity).toFixed(2)}</p></div>
                    </div>
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center border border-slate-200 rounded-lg bg-white">
                        <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="p-2 hover:bg-slate-50 transition-colors rounded-l-lg" disabled={updating === item.id}><Minus className="w-3.5 h-3.5" /></button>
                        <span className="px-3 py-1 text-sm font-medium min-w-[2rem] text-center">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, Math.min(item.products.stock, item.quantity + 1))} className="p-2 hover:bg-slate-50 transition-colors rounded-r-lg" disabled={updating === item.id}><Plus className="w-3.5 h-3.5" /></button>
                      </div>
                      <button onClick={() => removeItem(item.id)} className="text-slate-400 hover:text-red-600 transition-colors p-2 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-1">
            <Card className="border-slate-200 shadow-sm sticky top-20">
              <CardHeader className="pb-4"><CardTitle className="text-lg">Order Summary</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between text-sm text-slate-600"><span>Subtotal</span><span className="font-medium">${subtotal.toFixed(2)}</span></div>
                  <div className="flex justify-between text-sm text-slate-600"><span>Tax (8%)</span><span className="font-medium">${tax.toFixed(2)}</span></div>
                  <div className="flex justify-between text-sm text-slate-600"><span>Shipping</span><span className="font-medium">{shipping === 0 ? <span className="text-emerald-600">Free</span> : `$${shipping.toFixed(2)}`}</span></div>
                </div>
                <div className="pt-4 border-t border-slate-200">
                  <div className="flex justify-between items-center mb-6"><span className="font-semibold text-slate-900">Total</span><span className="text-2xl font-bold text-slate-900">${total.toFixed(2)}</span></div>
                  <Link href="/checkout"><Button className="w-full h-12 text-base font-semibold" size="lg">Proceed to Checkout</Button></Link>
                </div>
                {shipping > 0 && (
                  <div className="flex items-start gap-2 bg-blue-50 rounded-lg p-3 mt-2"><Truck className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" /><p className="text-xs text-blue-700">Add ${(100 - subtotal).toFixed(2)} more for free shipping!</p></div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
