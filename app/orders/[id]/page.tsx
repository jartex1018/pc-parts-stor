'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Check } from 'lucide-react';

interface Order {
  id: string;
  status: string;
  total_amount: number;
  created_at: string;
  shipping_address: any;
}

interface OrderItem {
  id: string;
  quantity: number;
  price_at_purchase: number;
  products: {
    id: string;
    name: string;
    image_url: string;
  };
}

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { session, loading: authLoading } = useAuth();
  const supabase = createClient();

  const [order, setOrder] = useState<Order | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !session) {
      router.push('/login');
      return;
    }

    if (session && params.id) {
      fetchOrder();
    }
  }, [session, authLoading, params.id]);

  async function fetchOrder() {
    const { data: orderData } = await supabase
      .from('orders')
      .select('*')
      .eq('id', params.id)
      .eq('user_id', session!.user.id)
      .single();

    if (orderData) {
      setOrder(orderData);
    }

    const { data: itemsData } = await supabase
      .from('order_items')
      .select('*, products(id, name, image_url)')
      .eq('order_id', params.id);

    if (itemsData) {
      setItems(itemsData as OrderItem[]);
    }

    setLoading(false);
  }

  if (authLoading || loading) {
    return <div className="min-h-screen bg-slate-50 py-12" />;
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-slate-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Order not found</h1>
          <Link href="/orders">
            <Button>Back to Orders</Button>
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

  const subtotal = items.reduce(
    (sum, item) => sum + item.price_at_purchase * item.quantity,
    0
  );
  const tax = subtotal * 0.08;
  const shipping = 10;

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/orders" className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4">
            <ArrowLeft className="w-4 h-4" />
            Back to Orders
          </Link>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold">Order Details</h1>
              <p className="text-slate-600 font-mono mt-2">
                Order ID: {order.id.substring(0, 12).toUpperCase()}...
              </p>
            </div>
            <Badge className={`${getStatusColor(order.status)} text-lg px-4 py-2`}>
              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </Badge>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Order Items */}
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Items</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-4 pb-4 border-b border-slate-200 last:border-0">
                    <div className="relative w-20 h-20 flex-shrink-0 bg-slate-100 rounded overflow-hidden">
                      <Image
                        src={item.products.image_url}
                        alt={item.products.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900">
                        {item.products.name}
                      </h3>
                      <p className="text-slate-600">
                        Quantity: {item.quantity}
                      </p>
                      <p className="text-slate-600">
                        ${item.price_at_purchase.toFixed(2)} each
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-slate-900">
                        ${(item.price_at_purchase * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Shipping Address */}
            <Card className="mt-8">
              <CardHeader>
                <CardTitle>Shipping Address</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-slate-700">
                  <p className="font-semibold">{order.shipping_address.fullName}</p>
                  <p>{order.shipping_address.address}</p>
                  <p>
                    {order.shipping_address.city}, {order.shipping_address.state}{' '}
                    {order.shipping_address.zipCode}
                  </p>
                  {order.shipping_address.phone && <p>{order.shipping_address.phone}</p>}
                  {order.shipping_address.email && <p>{order.shipping_address.email}</p>}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Summary */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Tax (8%)</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Shipping</span>
                    <span>${shipping.toFixed(2)}</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-200">
                  <div className="flex justify-between items-center mb-4">
                    <span className="font-semibold text-slate-900">Total</span>
                    <span className="text-2xl font-bold text-blue-600">
                      ${order.total_amount.toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-lg p-4">
                  <p className="text-sm text-slate-600 mb-2">
                    Ordered on {new Date(order.created_at).toLocaleDateString()}
                  </p>
                </div>

                {order.status === 'delivered' && (
                  <div className="bg-green-50 rounded-lg p-4 flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-green-700">
                      Your order has been delivered. Thank you for your purchase!
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Link href="/products" className="block mt-4">
              <Button variant="outline" className="w-full">
                Continue Shopping
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
