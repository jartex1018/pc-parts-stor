'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trash2, ShoppingCart, ArrowLeft } from 'lucide-react';
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
    stock: number;
  };
}

export default function CartPage() {
  const { session, loading: authLoading } = useAuth();
  const router = useRouter();
  const supabase = createClient();

  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !session) {
      router.push('/login');
      return;
    }

    if (session) {
      fetchCart();
    }
  }, [session, authLoading]);

  async function fetchCart() {
    const { data } = await supabase
      .from('cart_items')
      .select('*, products(id, name, price, image_url, stock)')
      .eq('user_id', session!.user.id);

    if (data) {
      setItems(data as CartItem[]);
    }
    setLoading(false);
  }

  async function updateQuantity(cartItemId: string, newQuantity: number) {
    if (newQuantity <= 0) {
      removeItem(cartItemId);
      return;
    }

    const { error } = await supabase
      .from('cart_items')
      .update({ quantity: newQuantity })
      .eq('id', cartItemId);

    if (!error) {
      setItems((prev) =>
        prev.map((item) =>
          item.id === cartItemId ? { ...item, quantity: newQuantity } : item
        )
      );
    }
  }

  async function removeItem(cartItemId: string) {
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('id', cartItemId);

    if (!error) {
      setItems((prev) => prev.filter((item) => item.id !== cartItemId));
      toast.success('Item removed from cart');
    }
  }

  const subtotal = items.reduce(
    (sum, item) => sum + item.products.price * item.quantity,
    0
  );
  const tax = subtotal * 0.08;
  const shipping = subtotal > 0 ? 10 : 0;
  const total = subtotal + tax + shipping;

  if (authLoading) {
    return <div className="min-h-screen bg-slate-50 py-12" />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg p-8 space-y-4 animate-pulse">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 bg-slate-200 rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <ShoppingCart className="w-16 h-16 mx-auto text-slate-300 mb-4" />
          <h1 className="text-2xl font-bold mb-2">Your cart is empty</h1>
          <p className="text-slate-600 mb-6">Start shopping to add items to your cart</p>
          <Link href="/products">
            <Button size="lg">Continue Shopping</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/products" className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4">
            <ArrowLeft className="w-4 h-4" />
            Continue Shopping
          </Link>
          <h1 className="text-4xl font-bold">Shopping Cart</h1>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4 p-6 border-b border-slate-200 last:border-0"
                >
                  <div className="relative w-24 h-24 flex-shrink-0 bg-slate-100 rounded-lg overflow-hidden">
                    <Image
                      src={item.products.image_url}
                      alt={item.products.name}
                      fill
                      className="object-cover"
                    />
                  </div>

                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <Link href={`/products/${item.products.id}`} className="hover:text-blue-600">
                        <h3 className="font-semibold text-slate-900 line-clamp-1">
                          {item.products.name}
                        </h3>
                      </Link>
                      <p className="text-slate-600">
                        ${item.products.price.toFixed(2)} each
                      </p>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center border border-slate-300 rounded-lg w-fit">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="px-3 py-1 hover:bg-slate-100"
                        >
                          −
                        </button>
                        <span className="px-3 py-1">{item.quantity}</span>
                        <button
                          onClick={() =>
                            updateQuantity(
                              item.id,
                              Math.min(item.products.stock, item.quantity + 1)
                            )
                          }
                          className="px-3 py-1 hover:bg-slate-100"
                        >
                          +
                        </button>
                      </div>

                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-red-600 hover:text-red-700 p-2"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  <div className="text-right flex flex-col justify-center">
                    <div className="text-xl font-bold text-slate-900">
                      ${(item.products.price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
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
                      ${total.toFixed(2)}
                    </span>
                  </div>

                  <Link href="/checkout">
                    <Button className="w-full" size="lg">
                      Proceed to Checkout
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            <div className="mt-4 bg-blue-50 rounded-lg p-4">
              <p className="text-sm text-blue-900">
                Free shipping on orders over $100!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
