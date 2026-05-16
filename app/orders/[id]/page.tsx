'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Check, MapPin, Package } from 'lucide-react';

interface Order { id: string; status: string; total_amount: number; created_at: string; shipping_address: any; }
interface OrderItem { id: string; quantity: number; price_at_purchase: number; products: { id: string; name: string; image_url: string; }; }

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { session, loading: authLoading } = useAuth();
  const supabase = createClient();
  const [order, setOrder] = useState<Order | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !session) { router.push('/login'); return; }
    if (session && params.id) fetchOrder();
  }, [session, authLoading, params.id]);

  async function fetchOrder() {
    const { data: orderData } = await supabase.from('orders').select('*').eq('id', params.id).eq('user_id', session!.user.id).single();
    if (orderData) setOrder(orderData);
    const { data: itemsData } = await supabase.from('order_items').select('*, products(id, name, image_url)').eq('order_id', params.id);
    if (itemsData) setItems(itemsData as OrderItem[]);
    setLoading(false);
  }

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'confirmed': return { label: 'Confirmed', bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500' };
      case 'shipped': return { label: 'Shipped', bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500' };
      case 'delivered': return { label: 'Delivered', bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' };
      case 'cancelled': return { label: 'Cancelled', bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500' };
      default: return { label: 'Pending', bg: 'bg-slate-50', text: 'text-slate-700', dot: 'bg-slate-400' };
    }
  };

  if (authLoading || loading) return <div className="min-h-screen bg-slate-50/50" />;
  if (!order) return (
    <div className="min-h-screen bg-slate-50/50 py-20"><div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center"><h1 className="text-2xl font-bold mb-4">Order not found</h1><Link href="/orders"><Button>Back to Orders</Button></Link></div></div>
  );

  const sc = getStatusConfig(order.status);
  const subtotal = items.reduce((sum, item) => sum + item.price_at_purchase * item.quantity, 0);
  const tax = subtotal * 0.08;
  const shipping = subtotal >= 100 ? 0 : 10;

  return (
    <div className="min-h-screen bg-slate-50/50">
      <div className="bg-white border-b border-slate-200/60">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link href="/orders" className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-700 font-medium text-sm mb-4"><ArrowLeft className="w-3.5 h-3.5" />Back to Orders</Link>
          <div className="flex items-center justify-between gap-4">
            <div><h1 className="text-2xl font-bold text-slate-900 tracking-tight">Order Details</h1><p className="font-mono text-xs text-slate-500 mt-1">#{order.id.substring(0, 12).toUpperCase()}</p></div>
            <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${sc.bg} ${sc.text}`}><div className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />{sc.label}</div>
          </div>
        </div>
      </div>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-6">
            <Card className="border-slate-200/80 shadow-sm">
              <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><Package className="w-4 h-4 text-slate-400" />Items ({items.length})</CardTitle></CardHeader>
              <CardContent className="space-y-0">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-3 py-3 border-b border-slate-100 last:border-0">
                    <div className="relative w-14 h-14 flex-shrink-0 bg-slate-50 rounded-lg overflow-hidden border border-slate-100"><Image src={item.products.image_url} alt={item.products.name} fill className="object-cover" sizes="56px" /></div>
                    <div className="flex-1 min-w-0"><h3 className="font-medium text-slate-900 text-sm">{item.products.name}</h3><p className="text-[11px] text-slate-500 mt-0.5">Qty: {item.quantity} x ${item.price_at_purchase.toFixed(2)}</p></div>
                    <div className="text-right flex-shrink-0"><p className="font-semibold text-slate-900 text-sm">${(item.price_at_purchase * item.quantity).toFixed(2)}</p></div>
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card className="border-slate-200/80 shadow-sm">
              <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><MapPin className="w-4 h-4 text-slate-400" />Shipping Address</CardTitle></CardHeader>
              <CardContent>
                <div className="text-sm text-slate-600 space-y-0.5">
                  <p className="font-semibold text-slate-900">{order.shipping_address.fullName}</p>
                  <p>{order.shipping_address.address}</p>
                  <p>{order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.zipCode}</p>
                  {order.shipping_address.email && <p>{order.shipping_address.email}</p>}
                  {order.shipping_address.phone && <p>{order.shipping_address.phone}</p>}
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="md:col-span-1">
            <Card className="border-slate-200/80 shadow-sm sticky top-20">
              <CardHeader className="pb-3"><CardTitle className="text-base">Order Summary</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2.5">
                  <div className="flex justify-between text-sm"><span className="text-slate-500">Subtotal</span><span className="font-medium">${subtotal.toFixed(2)}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-slate-500">Tax (8%)</span><span className="font-medium">${tax.toFixed(2)}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-slate-500">Shipping</span><span className="font-medium">{shipping === 0 ? <span className="text-emerald-600">Free</span> : `$${shipping.toFixed(2)}`}</span></div>
                </div>
                <div className="pt-4 border-t border-slate-100">
                  <div className="flex justify-between items-center"><span className="font-semibold text-slate-900">Total</span><span className="text-xl font-bold text-slate-900">${order.total_amount.toFixed(2)}</span></div>
                </div>
                <div className="bg-slate-50 rounded-lg p-3">
                  <p className="text-[11px] text-slate-500">Ordered {new Date(order.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
                {order.status === 'delivered' && (
                  <div className="bg-emerald-50 rounded-lg p-3 flex items-start gap-2"><Check className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" /><p className="text-xs text-emerald-700">Your order has been delivered!</p></div>
                )}
                <Link href="/products" className="block"><Button variant="outline" className="w-full border-slate-200 text-slate-700 text-sm">Continue Shopping</Button></Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
