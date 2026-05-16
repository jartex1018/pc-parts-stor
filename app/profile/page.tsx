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
import { User, Mail, Lock, Package, ShoppingCart, ChevronRight, Save, Calendar, MapPin } from 'lucide-react';

interface Profile { id: string; full_name: string; phone: string; avatar_url: string; }

export default function ProfilePage() {
  const { session, loading: authLoading } = useAuth();
  const router = useRouter();
  const supabase = createClient();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [orderCount, setOrderCount] = useState(0);
  const [cartCount, setCartCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!authLoading && !session) { router.push('/login'); return; }
    if (session) {
      setEmail(session.user.email || '');
      fetchProfile();
      fetchStats();
    }
  }, [session, authLoading]);

  async function fetchProfile() {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session!.user.id)
        .maybeSingle();

      if (data) {
        setProfile(data);
        setFullName(data.full_name || '');
        setPhone(data.phone || '');
      } else {
        // Create profile if it doesn't exist
        const { error: insertError } = await supabase
          .from('profiles')
          .insert({ id: session!.user.id, full_name: '', phone: '' });

        if (!insertError) {
          setProfile({ id: session!.user.id, full_name: '', phone: '', avatar_url: '' });
        }
      }
    } catch (err) {
      // Profile fetch failed, that's okay
    }
    setLoading(false);
  }

  async function fetchStats() {
    try {
      const { count: orders } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', session!.user.id);
      setOrderCount(orders || 0);

      const { data: cartItems } = await supabase
        .from('cart_items')
        .select('quantity')
        .eq('user_id', session!.user.id);
      setCartCount(cartItems?.reduce((sum, item) => sum + item.quantity, 0) || 0);
    } catch (err) {
      // Stats fetch failed, that's okay
    }
  }

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: session!.user.id,
          full_name: fullName.trim(),
          phone: phone.trim(),
          updated_at: new Date().toISOString(),
        });

      if (error) {
        toast.error('Failed to save profile');
        return;
      }

      setProfile({ ...profile!, full_name: fullName.trim(), phone: phone.trim() });
      toast.success('Profile saved successfully');
    } catch (err) {
      toast.error('Something went wrong');
    } finally {
      setSaving(false);
    }
  }

  async function handleChangePassword() {
    if (!email) return;
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/login`,
      });
      if (error) { toast.error(error.message); return; }
      toast.success('Password reset email sent! Check your inbox.');
    } catch (err) {
      toast.error('Something went wrong');
    }
  }

  if (authLoading || loading) return <div className="min-h-screen bg-slate-50/40" />;

  const displayName = fullName || session?.user.email?.split('@')[0] || 'User';
  const memberSince = session?.user.created_at
    ? new Date(session.user.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })
    : '';

  return (
    <div className="min-h-screen bg-slate-50/40">
      <div className="bg-white border-b border-slate-200/60">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-7">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center shadow-sm shadow-blue-600/20">
              <User className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">{displayName}</h1>
              <p className="text-slate-500 text-[13px] mt-0.5">{session?.user.email}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-7 space-y-4 animate-fade-in">
        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="border-slate-200/70 shadow-sm">
            <CardContent className="p-3.5 text-center">
              <p className="text-xl font-bold text-slate-900">{orderCount}</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Orders</p>
            </CardContent>
          </Card>
          <Card className="border-slate-200/70 shadow-sm">
            <CardContent className="p-3.5 text-center">
              <p className="text-xl font-bold text-slate-900">{cartCount}</p>
              <p className="text-[11px] text-slate-500 mt-0.5">In Cart</p>
            </CardContent>
          </Card>
          <Card className="border-slate-200/70 shadow-sm">
            <CardContent className="p-3.5 text-center">
              <p className="text-xl font-bold text-slate-900">{memberSince ? new Date(session!.user.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'N/A'}</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Member Since</p>
            </CardContent>
          </Card>
        </div>

        {/* Profile Info */}
        <Card className="border-slate-200/70 shadow-sm">
          <CardHeader className="pb-3 pt-4 px-4">
            <CardTitle className="text-sm flex items-center gap-1.5"><User className="w-3.5 h-3.5 text-slate-400" />Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <form onSubmit={handleSaveProfile} className="space-y-3.5">
              <div className="grid sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[11px] font-medium text-slate-700 mb-1">Full Name</label>
                  <Input value={fullName} onChange={(e) => setFullName(e.target.value)} disabled={saving} className="h-9 text-[13px]" placeholder="Enter your name" />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-700 mb-1">Phone</label>
                  <Input value={phone} onChange={(e) => setPhone(e.target.value)} disabled={saving} className="h-9 text-[13px]" placeholder="Enter your phone" />
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-medium text-slate-700 mb-1">Email</label>
                <Input value={email} disabled className="h-9 text-[13px] bg-slate-50 text-slate-500" />
                <p className="text-[9px] text-slate-400 mt-1">Email cannot be changed here. Contact support if needed.</p>
              </div>
              <Button type="submit" disabled={saving} className="bg-blue-600 hover:bg-blue-500 shadow-sm shadow-blue-600/20 h-9 text-[13px] btn-glow">
                <Save className="w-3.5 h-3.5 mr-1" />{saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Security */}
        <Card className="border-slate-200/70 shadow-sm">
          <CardHeader className="pb-3 pt-4 px-4">
            <CardTitle className="text-sm flex items-center gap-1.5"><Lock className="w-3.5 h-3.5 text-slate-400" />Security</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <p className="text-[13px] text-slate-500 mb-3.5">Reset your password to keep your account secure.</p>
            <Button variant="outline" onClick={handleChangePassword} className="border-slate-200 h-9 text-[13px]">Reset Password</Button>
          </CardContent>
        </Card>

        {/* Quick Links */}
        <Card className="border-slate-200/70 shadow-sm">
          <CardHeader className="pb-2 pt-4 px-4"><CardTitle className="text-sm">Quick Links</CardTitle></CardHeader>
          <CardContent className="px-4 pb-3 space-y-0.5">
            <Link href="/orders" className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 transition-colors group">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center group-hover:bg-blue-50 transition-colors">
                  <Package className="w-3.5 h-3.5 text-slate-500 group-hover:text-blue-600 transition-colors" />
                </div>
                <div><p className="font-medium text-slate-900 text-[13px]">Order History</p><p className="text-[10px] text-slate-500">{orderCount} order{orderCount !== 1 ? 's' : ''}</p></div>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-blue-500 transition-colors" />
            </Link>
            <Link href="/cart" className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 transition-colors group">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center group-hover:bg-blue-50 transition-colors">
                  <ShoppingCart className="w-3.5 h-3.5 text-slate-500 group-hover:text-blue-600 transition-colors" />
                </div>
                <div><p className="font-medium text-slate-900 text-[13px]">Shopping Cart</p><p className="text-[10px] text-slate-500">{cartCount} item{cartCount !== 1 ? 's' : ''}</p></div>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-blue-500 transition-colors" />
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
