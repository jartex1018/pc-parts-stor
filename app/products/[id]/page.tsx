'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { createClient } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Check, Heart } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  image_url: string;
  brand: string;
  specs: Record<string, any>;
  category_id: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { session } = useAuth();
  const supabase = createClient();

  const [product, setProduct] = useState<Product | null>(null);
  const [category, setCategory] = useState<Category | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    async function fetchProduct() {
      const { data } = await supabase
        .from('products')
        .select('*')
        .eq('id', params.id)
        .single();

      if (data) {
        setProduct(data);

        // Fetch category
        const { data: catData } = await supabase
          .from('categories')
          .select('*')
          .eq('id', data.category_id)
          .single();

        if (catData) {
          setCategory(catData);
        }
      }
      setLoading(false);
    }

    if (params.id) {
      fetchProduct();
    }
  }, [params.id]);

  async function handleAddToCart() {
    if (!session) {
      toast.error('Please log in to add items to cart');
      router.push('/login');
      return;
    }

    if (!product) return;

    setAdding(true);
    try {
      const { error: deleteError } = await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', session.user.id)
        .eq('product_id', product.id);

      const { error: insertError } = await supabase
        .from('cart_items')
        .insert({
          user_id: session.user.id,
          product_id: product.id,
          quantity,
        });

      if (insertError) {
        toast.error('Failed to add to cart');
        return;
      }

      toast.success('Added to cart!');
    } catch (err) {
      toast.error('An error occurred');
    } finally {
      setAdding(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg p-8 space-y-6 animate-pulse">
            <div className="h-96 bg-slate-200 rounded" />
            <div className="h-8 bg-slate-200 rounded w-1/2" />
            <div className="h-6 bg-slate-200 rounded w-1/4" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-slate-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Product not found</h1>
          <Link href="/products">
            <Button>Back to Products</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="mb-8 flex items-center gap-2">
          <Link href="/products" className="text-slate-600 hover:text-slate-900 flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" />
            Back to Products
          </Link>
          {category && (
            <>
              <span className="text-slate-400">/</span>
              <Link href={`/products?category=${category.slug}`} className="text-slate-600 hover:text-slate-900">
                {category.name}
              </Link>
            </>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-12">
          {/* Image */}
          <div className="bg-white rounded-lg overflow-hidden shadow-md">
            <div className="relative h-96 md:h-full min-h-96">
              <Image
                src={product.image_url}
                alt={product.name}
                fill
                className="object-cover"
              />
            </div>
          </div>

          {/* Details */}
          <div className="space-y-8">
            <div>
              <p className="text-sm font-medium text-slate-500 uppercase mb-2">
                {product.brand}
              </p>
              <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                {product.name}
              </h1>
              <p className="text-slate-600">{product.description}</p>
            </div>

            {/* Price and Stock */}
            <div className="bg-white rounded-lg p-6 space-y-4">
              <div className="text-4xl font-bold text-blue-600">
                ${product.price.toFixed(2)}
              </div>

              <div className="flex items-center gap-2">
                {product.stock > 0 ? (
                  <>
                    <Check className="w-5 h-5 text-green-600" />
                    <span className="font-medium text-green-700">
                      {product.stock} in stock
                    </span>
                  </>
                ) : (
                  <span className="font-medium text-red-700">Out of stock</span>
                )}
              </div>

              {/* Quantity Selector */}
              {product.stock > 0 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Quantity</label>
                    <div className="flex items-center border border-slate-300 rounded-lg w-fit">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="px-4 py-2 hover:bg-slate-100"
                      >
                        −
                      </button>
                      <Input
                        type="number"
                        value={quantity}
                        onChange={(e) =>
                          setQuantity(
                            Math.min(
                              product.stock,
                              Math.max(1, parseInt(e.target.value) || 1)
                            )
                          )
                        }
                        className="w-16 border-0 text-center"
                      />
                      <button
                        onClick={() =>
                          setQuantity(Math.min(product.stock, quantity + 1))
                        }
                        className="px-4 py-2 hover:bg-slate-100"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <Button
                    onClick={handleAddToCart}
                    size="lg"
                    className="w-full"
                    disabled={adding}
                  >
                    {adding ? 'Adding...' : 'Add to Cart'}
                  </Button>
                </div>
              )}
            </div>

            {/* Specifications */}
            {Object.keys(product.specs).length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Specifications</CardTitle>
                </CardHeader>
                <CardContent>
                  <dl className="space-y-4">
                    {Object.entries(product.specs).map(([key, value]) => (
                      <div key={key} className="flex justify-between py-2 border-b border-slate-200 last:border-0">
                        <dt className="font-medium text-slate-700 capitalize">
                          {key.replace(/_/g, ' ')}
                        </dt>
                        <dd className="text-slate-600">{String(value)}</dd>
                      </div>
                    ))}
                  </dl>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
