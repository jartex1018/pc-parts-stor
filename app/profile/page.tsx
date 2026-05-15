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
import { User, Mail, Lock, Package, ShoppingCart, ChevronRight } from 'lucide-react';

export default function ProfilePage() {
  const { session, loading: authLoading } = useAuth();
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && !session) { router.push('/login'); return; }
    if (session) setEmail(session.user.email || '');
  }, [session, authLoading]);

  async function handleUpdateProfile(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ email });
      if (error) { toast.error(error.message); return; }
      toast.success('Profile updated successfully');
    } catch (err) { toast.error('An error occurred'); }
    finally { setLoading(false); }
  }

  async function handleChangePassword() {
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/reset-password` });
      if (error) { toast.error(error.message); return; }
      toast.success('Check your email for password reset instructions');
    } catch (err) { toast.error('An error occurred'); }
    finally { setLoading(false); }
  }

  if (authLoading) return <div className="min-h-screen bg-slate-50 py-12" />;

  const quickLinks = [
    { href: '/orders', icon: Package, label: 'Order History', description: 'View your past orders and track shipments' },
    { href: '/cart', icon: ShoppingCart, label: 'Shopping Cart', description: 'View items in your cart' },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center"><User className="w-8 h-8 text-white" /></div>
            <div><h1 className="text-3xl font-bold text-slate-900 tracking-tight">My Profile</h1><p className="text-slate-500 mt-1">{session?.user.email}</p></div>
          </div>
        </div>
      </div>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <Card className="border-slate-200 shadow-sm">
          <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Mail className="w-5 h-5 text-slate-400" />Account Information</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Email Address</label><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} disabled={loading} className="h-11" /></div>
              <Button type="submit" disabled={loading}>{loading ? 'Updating...' : 'Update Email'}</Button>
            </form>
          </CardContent>
        </Card>
        <Card className="border-slate-200 shadow-sm">
          <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Lock className="w-5 h-5 text-slate-400" />Security</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm text-slate-500 mb-4">Keep your account secure by changing your password regularly.</p>
            <Button variant="outline" onClick={handleChangePassword} disabled={loading}>Change Password</Button>
          </CardContent>
        </Card>
        <Card className="border-slate-200 shadow-sm">
          <CardHeader><CardTitle className="text-lg">Quick Links</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {quickLinks.map((link) => (
              <Link key={link.href} href={link.href} className="flex items-center justify-between p-4 rounded-xl hover:bg-slate-50 transition-colors group">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center group-hover:bg-blue-50 transition-colors">
                    <link.icon className="w-5 h-5 text-slate-500 group-hover:text-blue-600 transition-colors" />
                  </div>
                  <div><p className="font-medium text-slate-900">{link.label}</p><p className="text-xs text-slate-500">{link.description}</p></div>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-blue-600 transition-colors" />
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
