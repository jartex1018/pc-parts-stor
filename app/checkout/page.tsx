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

interface CartItem {
  id: string;
  product_id: string;
  quantity: number;
  products: {
    id: string;
    name: string;
    price: number;
    image_url: string;
  };
}

export default function CheckoutPage() {
  const { session, loading: authLoading } = useAuth();
  const router = useRouter();
  const supabase = createClient();

  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  // Form state
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');

  useEffect(() => {
    if (!authLoading && !session) {
      router.push('/login');
      return;
    }

    if (session) {
      setEmail(session.user.email || '');
      fetchCart();
    }
  }, [session, authLoading]);

  async function fetchCart() {
    const { data } = await supabase
      .from('cart_items')
      .select('*, products(id, name, price, image_url)')
      .eq('user_id', session!.user.id);

    if (data) {
      setItems(data as CartItem[]);
    }
    setLoading(false);
  }

  async function handleCheckout(e: React.FormEvent) {
    e.preventDefault();

    if (!fullName || !address || !city || !state || !zipCode) {
      toast.error('Please fill in all address fields');
      return;
    }

    setProcessing(true);

    try {
      const subtotal = items.reduce(
        (sum, item) => sum + item.products.price * item.quantity,
        0
      );
      const tax = subtotal * 0.08;
      const shipping = 10;
      const total = subtotal + tax + shipping;

      const shippingAddress = {
        fullName,
        email,
        phone,
        address,
        city,
        state,
        zipCode,
      };

      // Create order
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: session!.user.id,
          total_amount: total,
          shipping_address: shippingAddress,
          status: 'confirmed',
        })
        .select()
        .single();

      if (orderError || !orderData) {
        toast.error('Failed to create order');
        return;
      }

      // Create order items
      const orderItems = items.map((item) => ({
        order_id: orderData.id,
        product_id: item.product_id,
        quantity: item.quantity,
        price_at_purchase: item.products.price,
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) {
        toast.error('Failed to add items to order');
        return;
      }

      // Clear cart
      await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', session!.user.id);

      toast.success('Order placed successfully!');
      router.push(`/orders/${orderData.id}`);
    } catch (err) {
      toast.error('An error occurred during checkout');
    } finally {
      setProcessing(false);
    }
  }

  if (authLoading || loading) {
    return <div className="min-h-screen bg-slate-50 py-12" />;
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 py-12">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Your cart is empty</h1>
          <Link href="/products">
            <Button>Continue Shopping</Button>
          </Link>
        </div>
      </div>
    );
  }

  const subtotal = items.reduce(
    (sum, item) => sum + item.products.price * item.quantity,
    0
  );
  const tax = subtotal * 0.08;
  const shipping = 10;
  const total = subtotal + tax + shipping;

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold mb-8">Checkout</h1>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Shipping Form */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Shipping Address</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCheckout} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Full Name</label>
                    <Input
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                      disabled={processing}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Email</label>
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={processing}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Phone</label>
                    <Input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      disabled={processing}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Address</label>
                    <Input
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      required
                      disabled={processing}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">City</label>
                      <Input
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        required
                        disabled={processing}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">State</label>
                      <Input
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        required
                        disabled={processing}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Zip Code</label>
                    <Input
                      value={zipCode}
                      onChange={(e) => setZipCode(e.target.value)}
                      required
                      disabled={processing}
                    />
                  </div>

                  <Button type="submit" className="w-full" size="lg" disabled={processing}>
                    {processing ? 'Processing...' : 'Place Order'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {items.map((item) => (
                    <div key={item.id} className="flex justify-between py-2 border-b border-slate-200">
                      <div>
                        <p className="font-medium text-slate-900 line-clamp-1">
                          {item.products.name}
                        </p>
                        <p className="text-sm text-slate-600">Qty: {item.quantity}</p>
                      </div>
                      <span className="font-semibold">
                        ${(item.products.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t border-slate-200 space-y-2">
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
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-slate-900">Total</span>
                    <span className="text-2xl font-bold text-blue-600">
                      ${total.toFixed(2)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
