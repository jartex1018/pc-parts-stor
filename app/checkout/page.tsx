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
import { ArrowLeft, Lock } from 'lucide-react';

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

  if (authLoading || loading) return <div className="min-h-screen bg-slate-50 py-12" />;
  if (items.length === 0) return (<div className="min-h-screen bg-slate-50 py-20"><div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center"><h1 className="text-2xl font-bold mb-4">Your cart is empty</h1><Link href="/products"><Button>Continue Shopping</Button></Link></div></div>);

  const subtotal = items.reduce((sum, item) => sum + item.products.price * item.quantity, 0);
  const tax = subtotal * 0.08;
  const shipping = subtotal >= 100 ? 0 : 10;
  const total = subtotal + tax + shipping;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">Checkout</h1>
          <p className="text-slate-500 mt-2">Complete your order</p>
        </div>
      </div>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link href="/cart" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium text-sm mb-6"><ArrowLeft className="w-4 h-4" />Back to Cart</Link>
        <form onSubmit={handleCheckout}>
          <div className="grid md:grid-cols-5 gap-8">
            <div className="md:col-span-3 space-y-6">
              <Card className="border-slate-200 shadow-sm">
                <CardHeader><CardTitle className="text-lg flex items-center gap-2"><span className="w-7 h-7 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">1</span>Shipping Address</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Full Name *</label><Input value={fullName} onChange={(e) => setFullName(e.target.value)} required disabled={processing} className="h-10" /></div>
                    <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Email *</label><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={processing} className="h-10" /></div>
                  </div>
                  <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Phone</label><Input value={phone} onChange={(e) => setPhone(e.target.value)} disabled={processing} className="h-10" /></div>
                  <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Street Address *</label><Input value={address} onChange={(e) => setAddress(e.target.value)} required disabled={processing} className="h-10" /></div>
                  <div className="grid grid-cols-3 gap-4">
                    <div><label className="block text-sm font-medium text-slate-700 mb-1.5">City *</label><Input value={city} onChange={(e) => setCity(e.target.value)} required disabled={processing} className="h-10" /></div>
                    <div><label className="block text-sm font-medium text-slate-700 mb-1.5">State *</label><Input value={state} onChange={(e) => setState(e.target.value)} required disabled={processing} className="h-10" /></div>
                    <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Zip *</label><Input value={zipCode} onChange={(e) => setZipCode(e.target.value)} required disabled={processing} className="h-10" /></div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-slate-200 shadow-sm">
                <CardHeader><CardTitle className="text-lg flex items-center gap-2"><span className="w-7 h-7 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">2</span>Review Items</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  {items.map((item) => (
                    <div key={item.id} className="flex justify-between py-2 border-b border-slate-100 last:border-0">
                      <div><p className="font-medium text-slate-900 text-sm">{item.products.name}</p><p className="text-xs text-slate-500">Qty: {item.quantity}</p></div>
                      <span className="font-semibold text-sm">${(item.products.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
            <div className="md:col-span-2">
              <Card className="border-slate-200 shadow-sm sticky top-20">
                <CardHeader className="pb-4"><CardTitle className="text-lg">Order Summary</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm text-slate-600"><span>Subtotal ({items.length} items)</span><span className="font-medium">${subtotal.toFixed(2)}</span></div>
                    <div className="flex justify-between text-sm text-slate-600"><span>Tax (8%)</span><span className="font-medium">${tax.toFixed(2)}</span></div>
                    <div className="flex justify-between text-sm text-slate-600"><span>Shipping</span><span className="font-medium">{shipping === 0 ? <span className="text-emerald-600">Free</span> : `$${shipping.toFixed(2)}`}</span></div>
                  </div>
                  <div className="pt-4 border-t border-slate-200">
                    <div className="flex justify-between items-center mb-6"><span className="font-semibold text-slate-900">Total</span><span className="text-2xl font-bold text-slate-900">${total.toFixed(2)}</span></div>
                    <Button type="submit" className="w-full h-12 text-base font-semibold" disabled={processing}>
                      {processing ? 'Processing...' : <><Lock className="w-4 h-4 mr-2" />Place Order</>}
                    </Button>
                    <p className="text-xs text-slate-400 text-center mt-3">Your payment information is secure and encrypted</p>
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
