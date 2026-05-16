'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Package, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';

interface Order { id: string; status: string; total_amount: number; created_at: string; }

export default function OrdersPage() {
  const { session, loading: authLoading } = useAuth();
  const router = useRouter();
  const supabase = createClient();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !session) { router.push('/login'); return; }
    if (session) fetchOrders();
  }, [session, authLoading]);

  async function fetchOrders() {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', session!.user.id)
        .order('created_at', { ascending: false });

      if (error) {
        toast.error('Failed to load orders');
      } else {
        setOrders(data || []);
      }
    } catch (err) {
      toast.error('Something went wrong');
    }
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

  if (authLoading || loading) return <div className="min-h-screen bg-slate-50/40" />;

  if (orders.length === 0) return (
    <div className="min-h-screen bg-slate-50/40 py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4"><Package className="w-7 h-7 text-slate-400" /></div>
        <h1 className="text-xl font-bold text-slate-900 mb-1.5">No orders yet</h1>
        <p className="text-slate-500 text-[13px] mb-6">Start shopping to place your first order</p>
        <Link href="/products"><Button size="lg" className="h-10 px-6 bg-blue-600 hover:bg-blue-500 text-sm btn-glow">Browse Products</Button></Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50/40">
      <div className="bg-white border-b border-slate-200/60">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-7">
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">My Orders</h1>
          <p className="text-slate-500 mt-0.5 text-[13px]">{orders.length} order{orders.length !== 1 ? 's' : ''}</p>
        </div>
      </div>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-7 space-y-2.5">
        {orders.map((order) => {
          const sc = getStatusConfig(order.status);
          return (
            <Link key={order.id} href={`/orders/${order.id}`}>
              <Card className="card-hover cursor-pointer border-slate-200/70 shadow-sm hover:border-blue-200/60 group animate-fade-in">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-mono text-[11px] text-slate-500">#{order.id.substring(0, 8).toUpperCase()}</p>
                        <div className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-semibold ${sc.bg} ${sc.text}`}>
                          <div className={`w-1 h-1 rounded-full ${sc.dot}`} />{sc.label}
                        </div>
                      </div>
                      <p className="text-[11px] text-slate-500">{new Date(order.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</p>
                    </div>
                    <div className="flex items-center gap-2.5 flex-shrink-0">
                      <span className="text-base font-bold text-slate-900">${order.total_amount.toFixed(2)}</span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-blue-500 transition-colors" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
