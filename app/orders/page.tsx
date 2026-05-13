'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Package } from 'lucide-react';

interface Order {
  id: string;
  status: string;
  total_amount: number;
  created_at: string;
}

export default function OrdersPage() {
  const { session, loading: authLoading } = useAuth();
  const router = useRouter();
  const supabase = createClient();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !session) {
      router.push('/login');
      return;
    }

    if (session) {
      fetchOrders();
    }
  }, [session, authLoading]);

  async function fetchOrders() {
    const { data } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', session!.user.id)
      .order('created_at', { ascending: false });

    if (data) {
      setOrders(data);
    }
    setLoading(false);
  }

  if (authLoading || loading) {
    return <div className="min-h-screen bg-slate-50 py-12" />;
  }

  if (orders.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Package className="w-16 h-16 mx-auto text-slate-300 mb-4" />
          <h1 className="text-2xl font-bold mb-2">No orders yet</h1>
          <p className="text-slate-600 mb-6">Start shopping to place your first order</p>
          <Link href="/products" className="text-blue-600 hover:underline">
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold mb-8">My Orders</h1>

        <div className="space-y-4">
          {orders.map((order) => (
            <Link key={order.id} href={`/orders/${order.id}`}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm text-slate-600 mb-1">Order ID</p>
                      <p className="font-mono text-sm text-slate-900 mb-4">
                        {order.id.substring(0, 8).toUpperCase()}...
                      </p>
                      <p className="text-sm text-slate-600">
                        {new Date(order.created_at).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-sm text-slate-600 mb-2">Total</p>
                      <p className="text-2xl font-bold text-slate-900 mb-3">
                        ${order.total_amount.toFixed(2)}
                      </p>
                      <Badge className={getStatusColor(order.status)}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
