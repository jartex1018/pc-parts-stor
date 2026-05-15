'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { ShoppingCart, ArrowRight, Check } from 'lucide-react';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    if (password !== confirmPassword) { toast.error('Passwords do not match'); setLoading(false); return; }
    if (password.length < 6) { toast.error('Password must be at least 6 characters'); setLoading(false); return; }
    try {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) { toast.error(error.message); return; }
      toast.success('Account created! You can now sign in.');
      router.push('/login');
    } catch (err) { toast.error('An unexpected error occurred'); }
    finally { setLoading(false); }
  }

  const benefits = ['Track your orders in real-time', 'Save items to your wishlist', 'Get exclusive member deals', 'Fast and secure checkout'];

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex flex-1 items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900 p-12">
        <div className="max-w-md space-y-8">
          <div className="w-20 h-20 bg-blue-600/20 rounded-2xl flex items-center justify-center mx-auto"><ShoppingCart className="w-10 h-10 text-blue-400" /></div>
          <h2 className="text-3xl font-bold text-white leading-tight text-center">Join PC Parts Store</h2>
          <div className="space-y-4">
            {benefits.map((benefit) => (
              <div key={benefit} className="flex items-center gap-3 text-slate-300">
                <div className="w-5 h-5 bg-emerald-500/20 rounded-full flex items-center justify-center flex-shrink-0"><Check className="w-3 h-3 text-emerald-400" /></div>
                <span className="text-sm">{benefit}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <Link href="/" className="flex items-center gap-2.5 mb-8">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center"><ShoppingCart className="w-4 h-4 text-white" /></div>
              <span className="font-bold text-lg text-slate-900">PC Parts</span>
            </Link>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Create your account</h1>
            <p className="text-slate-500 mt-2">Start shopping premium PC components</p>
          </div>
          <form onSubmit={handleRegister} className="space-y-5">
            <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label><Input type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={loading} className="h-11" /></div>
            <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label><Input type="password" placeholder="At least 6 characters" value={password} onChange={(e) => setPassword(e.target.value)} required disabled={loading} className="h-11" /></div>
            <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Confirm Password</label><Input type="password" placeholder="Repeat your password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required disabled={loading} className="h-11" /></div>
            <Button type="submit" className="w-full h-11 text-base font-semibold" disabled={loading}>{loading ? 'Creating account...' : 'Create Account'}{!loading && <ArrowRight className="w-4 h-4 ml-2" />}</Button>
          </form>
          <div className="mt-8 text-center"><p className="text-sm text-slate-500">Already have an account? <Link href="/login" className="text-blue-600 hover:text-blue-700 font-semibold">Sign in</Link></p></div>
        </div>
      </div>
    </div>
  );
}
