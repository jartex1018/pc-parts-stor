'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { ShoppingCart, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) { toast.error(error.message); return; }
      toast.success('Welcome back!');
      router.push('/');
    } catch (err) { toast.error('An unexpected error occurred'); }
    finally { setLoading(false); }
  }

  return (
    <div className="min-h-screen flex">
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <Link href="/" className="flex items-center gap-2.5 mb-8">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center"><ShoppingCart className="w-4 h-4 text-white" /></div>
              <span className="font-bold text-lg text-slate-900">PC Parts</span>
            </Link>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Welcome back</h1>
            <p className="text-slate-500 mt-2">Sign in to your account to continue shopping</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-5">
            <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label><Input type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={loading} className="h-11" /></div>
            <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label><Input type="password" placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} required disabled={loading} className="h-11" /></div>
            <Button type="submit" className="w-full h-11 text-base font-semibold" disabled={loading}>{loading ? 'Signing in...' : 'Sign In'}{!loading && <ArrowRight className="w-4 h-4 ml-2" />}</Button>
          </form>
          <div className="mt-8 text-center"><p className="text-sm text-slate-500">Don't have an account? <Link href="/register" className="text-blue-600 hover:text-blue-700 font-semibold">Create one</Link></p></div>
        </div>
      </div>
      <div className="hidden lg:flex flex-1 items-center justify-center bg-gradient-to-br from-blue-600 to-blue-800 p-12">
        <div className="max-w-md text-center space-y-8">
          <div className="w-20 h-20 bg-white/10 rounded-2xl flex items-center justify-center mx-auto backdrop-blur-sm"><ShoppingCart className="w-10 h-10 text-white" /></div>
          <h2 className="text-3xl font-bold text-white leading-tight">Build Your Dream PC Today</h2>
          <p className="text-blue-100 text-lg leading-relaxed">Access premium components, track your orders, and get exclusive deals when you sign in.</p>
          <div className="flex items-center justify-center gap-6 text-blue-200 text-sm">
            <div className="flex items-center gap-2"><div className="w-2 h-2 bg-blue-300 rounded-full" />Free Shipping</div>
            <div className="flex items-center gap-2"><div className="w-2 h-2 bg-blue-300 rounded-full" />2-Year Warranty</div>
          </div>
        </div>
      </div>
    </div>
  );
}
