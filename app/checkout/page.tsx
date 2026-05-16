'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { ArrowLeft, Lock, Check } from 'lucide-react';

interface CartItem { id: string; product_id: string; quantity: number; products: { id: string; name: string; price: number; image_url: string; }; }

export default function CheckoutPage() {
  const { session, loading: authLoading } = useAuth();
  const router = useRouter();
  const supabase = createClient();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');

  useEffect(() => {
    if (!authLoading && !session) { router.push('/login'); return; }
    if (session) { setEmail(session.user.email || ''); fetchCart(); }
  }, [session, authLoading]);

  async function fetchCart() {
    const { data } = await supabase.from('cart_items').select('*, products(id, name, price, image_url)').eq('user_id', session!.user.id);
    if (data) setItems(data as CartItem[]);
    setLoading(false);
  }

  async function handleCheckout(e: React.FormEvent) {
    e.preventDefault();
    if (!fullName || !address || !city || !state || !zipCode) { toast.error('Please fill in all address fields'); return; }
    setProcessing(true);
    try {
      const subtotal = items.reduce((sum, item) => sum + item.products.price * item.quantity, 0);
      const tax = subtotal * 0.08;
      const shipping = subtotal >= 100 ? 0 : 10;
      const total = subtotal + tax + shipping;
      const shippingAddress = { fullName, email, phone, address, city, state, zipCode };
      const { data: orderData, error: orderError } = await supabase.from('orders').insert({ user_id: session!.user.id, total_amount: total, shipping_address: shippingAddress, status: 'confirmed' }).select().single();
      if (orderError || !orderData) { toast.error('Failed to create order'); return; }
      const orderItems = items.map((item) => ({ order_id: orderData.id, product_id: item.product_id, quantity: item.quantity, price_at_purchase: item.products.price }));
      const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
      if (itemsError) { toast.error('Failed to add items to order'); return; }
      await supabase.from('cart_items').delete().eq('user_id', session!.user.id);
      toast.success('Order placed successfully!');
      router.push(`/orders/${orderData.id}`);
    } catch (err) { toast.error('An error occurred during checkout'); }
    finally { setProcessing(false); }
  }

  if (authLoading || loading) return <div className="min-h-screen bg-slate-50/40" />;
  if (items.length === 0) return (
    <div className="min-h-screen bg-slate-50/40 py-20"><div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center"><h1 className="text-xl font-bold mb-3">Your cart is empty</h1><Link href="/products"><Button className="bg-blue-600 hover:bg-blue-500">Continue Shopping</Button></Link></div></div>
  );

  const subtotal = items.reduce((sum, item) => sum + item.products.price * item.quantity, 0);
  const tax = subtotal * 0.08;
  const shipping = subtotal >= 100 ? 0 : 10;
  const total = subtotal + tax + shipping;

  const steps = ['Shipping', 'Review', 'Confirm'];

  return (
    <div className="min-h-screen bg-slate-50/40">
      <div className="bg-white border-b border-slate-200/60">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-7">
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">Checkout</h1>
          <div className="flex items-center gap-1.5 mt-3">
            {steps.map((step, i) => (
              <div key={step} className="flex items-center gap-1.5">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold ${i === 0 ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-500'}`}>{i === 0 ? <Check className="w-2.5 h-2.5" /> : i + 1}</div>
                <span className={`text-[11px] font-medium ${i === 0 ? 'text-blue-600' : 'text-slate-400'}`}>{step}</span>
                {i < steps.length - 1 && <div className="w-6 h-px bg-slate-200 mx-1" />}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-7">
        <Link href="/cart" className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 font-medium text-[13px] mb-5"><ArrowLeft className="w-3.5 h-3.5" />Back to Cart</Link>
        <form onSubmit={handleCheckout}>
          <div className="grid md:grid-cols-5 gap-7">
            <div className="md:col-span-3 space-y-5">
              <Card className="border-slate-200/70 shadow-sm">
                <CardHeader className="pb-3 pt-4 px-4"><CardTitle className="text-sm">Shipping Address</CardTitle></CardHeader>
                <CardContent className="px-4 pb-4 space-y-3.5">
                  <div className="grid sm:grid-cols-2 gap-3.5">
                    <div><label className="block text-[11px] font-medium text-slate-700 mb-1">Full Name *</label><Input value={fullName} onChange={(e) => setFullName(e.target.value)} required disabled={processing} className="h-9 text-[13px]" /></div>
                    <div><label className="block text-[11px] font-medium text-slate-700 mb-1">Email *</label><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={processing} className="h-9 text-[13px]" /></div>
                  </div>
                  <div><label className="block text-[11px] font-medium text-slate-700 mb-1">Phone</label><Input value={phone} onChange={(e) => setPhone(e.target.value)} disabled={processing} className="h-9 text-[13px]" /></div>
                  <div><label className="block text-[11px] font-medium text-slate-700 mb-1">Street Address *</label><Input value={address} onChange={(e) => setAddress(e.target.value)} required disabled={processing} className="h-9 text-[13px]" /></div>
                  <div className="grid grid-cols-3 gap-3.5">
                    <div><label className="block text-[11px] font-medium text-slate-700 mb-1">City *</label><Input value={city} onChange={(e) => setCity(e.target.value)} required disabled={processing} className="h-9 text-[13px]" /></div>
                    <div><label className="block text-[11px] font-medium text-slate-700 mb-1">State *</label><Input value={state} onChange={(e) => setState(e.target.value)} required disabled={processing} className="h-9 text-[13px]" /></div>
                    <div><label className="block text-[11px] font-medium text-slate-700 mb-1">Zip *</label><Input value={zipCode} onChange={(e) => setZipCode(e.target.value)} required disabled={processing} className="h-9 text-[13px]" /></div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-slate-200/70 shadow-sm">
                <CardHeader className="pb-2 pt-4 px-4"><CardTitle className="text-sm">Order Items</CardTitle></CardHeader>
                <CardContent className="px-4 pb-4 space-y-0">
                  {items.map((item) => (
                    <div key={item.id} className="flex justify-between py-2 border-b border-slate-100 last:border-0 text-[13px]">
                      <div><span className="font-medium text-slate-900">{item.products.name}</span><span className="text-slate-500 ml-1.5">x{item.quantity}</span></div>
                      <span className="font-medium">${(item.products.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
            <div className="md:col-span-2">
              <Card className="border-slate-200/70 shadow-sm sticky top-[72px]">
                <CardHeader className="pb-2 pt-4 px-4"><CardTitle className="text-sm">Order Summary</CardTitle></CardHeader>
                <CardContent className="px-4 pb-4 space-y-3.5">
                  <div className="space-y-2">
                    <div className="flex justify-between text-[13px]"><span className="text-slate-500">Subtotal ({items.length} items)</span><span className="font-medium">${subtotal.toFixed(2)}</span></div>
                    <div className="flex justify-between text-[13px]"><span className="text-slate-500">Tax (8%)</span><span className="font-medium">${tax.toFixed(2)}</span></div>
                    <div className="flex justify-between text-[13px]"><span className="text-slate-500">Shipping</span><span className="font-medium">{shipping === 0 ? <span className="text-emerald-600">Free</span> : `$${shipping.toFixed(2)}`}</span></div>
                  </div>
                  <div className="pt-3 border-t border-slate-100">
                    <div className="flex justify-between items-center mb-4"><span className="font-semibold text-slate-900 text-sm">Total</span><span className="text-lg font-bold text-slate-900">${total.toFixed(2)}</span></div>
                    <Button type="submit" className="w-full h-10 text-sm font-semibold bg-blue-600 hover:bg-blue-500 shadow-sm shadow-blue-600/20 btn-glow" disabled={processing}>
                      {processing ? 'Processing...' : <><Lock className="w-3.5 h-3.5 mr-1.5" />Place Order</>}
                    </Button>
                    <p className="text-[9px] text-slate-400 text-center mt-2.5">Your payment information is secure and encrypted</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
