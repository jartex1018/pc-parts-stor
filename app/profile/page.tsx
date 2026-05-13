'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import Link from 'next/link';

export default function ProfilePage() {
  const { session, loading: authLoading } = useAuth();
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && !session) {
      router.push('/login');
      return;
    }

    if (session) {
      setEmail(session.user.email || '');
    }
  }, [session, authLoading]);

  async function handleUpdateProfile(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        email,
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      toast.success('Profile updated successfully');
    } catch (err) {
      toast.error('An error occurred');
    } finally {
      setLoading(false);
    }
  }

  async function handleChangePassword() {
    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      toast.success('Check your email for password reset instructions');
    } catch (err) {
      toast.error('An error occurred');
    } finally {
      setLoading(false);
    }
  }

  if (authLoading) {
    return <div className="min-h-screen bg-slate-50 py-12" />;
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold mb-8">My Profile</h1>

        <div className="space-y-6">
          {/* Account Information */}
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Email</label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                  />
                </div>

                <Button type="submit" disabled={loading}>
                  {loading ? 'Updating...' : 'Update Email'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Security */}
          <Card>
            <CardHeader>
              <CardTitle>Security</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-slate-600">
                Keep your account secure by changing your password regularly.
              </p>
              <Button
                variant="outline"
                onClick={handleChangePassword}
                disabled={loading}
              >
                Change Password
              </Button>
            </CardContent>
          </Card>

          {/* Quick Links */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Links</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/orders" className="block text-blue-600 hover:underline">
                View Order History
              </Link>
              <Link href="/cart" className="block text-blue-600 hover:underline">
                View Shopping Cart
              </Link>
              <Link href="/products" className="block text-blue-600 hover:underline">
                Continue Shopping
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
