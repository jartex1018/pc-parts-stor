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

  if (authLoading) return <div className="min-h-screen bg-slate-50/40" />;

  const quickLinks = [
    { href: '/orders', icon: Package, label: 'Order History', description: 'View past orders and track shipments' },
    { href: '/cart', icon: ShoppingCart, label: 'Shopping Cart', description: 'View items in your cart' },
  ];

  return (
    <div className="min-h-screen bg-slate-50/40">
      <div className="bg-white border-b border-slate-200/60">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-7">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center shadow-sm shadow-blue-600/20"><User className="w-6 h-6 text-white" /></div>
            <div><h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">My Profile</h1><p className="text-slate-500 text-[13px] mt-0.5">{session?.user.email}</p></div>
          </div>
        </div>
      </div>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-7 space-y-4 animate-fade-in">
        <Card className="border-slate-200/70 shadow-sm">
          <CardHeader className="pb-3 pt-4 px-4"><CardTitle className="text-sm flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-slate-400" />Account Information</CardTitle></CardHeader>
          <CardContent className="px-4 pb-4">
            <form onSubmit={handleUpdateProfile} className="space-y-3.5">
              <div><label className="block text-[11px] font-medium text-slate-700 mb-1">Email Address</label><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} disabled={loading} className="h-9 text-[13px]" /></div>
              <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-500 shadow-sm shadow-blue-600/20 h-9 text-[13px] btn-glow">{loading ? 'Updating...' : 'Update Email'}</Button>
            </form>
          </CardContent>
        </Card>
        <Card className="border-slate-200/70 shadow-sm">
          <CardHeader className="pb-3 pt-4 px-4"><CardTitle className="text-sm flex items-center gap-1.5"><Lock className="w-3.5 h-3.5 text-slate-400" />Security</CardTitle></CardHeader>
          <CardContent className="px-4 pb-4">
            <p className="text-[13px] text-slate-500 mb-3.5">Keep your account secure by changing your password regularly.</p>
            <Button variant="outline" onClick={handleChangePassword} disabled={loading} className="border-slate-200 h-9 text-[13px]">Change Password</Button>
          </CardContent>
        </Card>
        <Card className="border-slate-200/70 shadow-sm">
          <CardHeader className="pb-2 pt-4 px-4"><CardTitle className="text-sm">Quick Links</CardTitle></CardHeader>
          <CardContent className="px-4 pb-3 space-y-0.5">
            {quickLinks.map((link) => (
              <Link key={link.href} href={link.href} className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 transition-colors group">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center group-hover:bg-blue-50 transition-colors">
                    <link.icon className="w-3.5 h-3.5 text-slate-500 group-hover:text-blue-600 transition-colors" />
                  </div>
                  <div><p className="font-medium text-slate-900 text-[13px]">{link.label}</p><p className="text-[10px] text-slate-500">{link.description}</p></div>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-blue-500 transition-colors" />
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
