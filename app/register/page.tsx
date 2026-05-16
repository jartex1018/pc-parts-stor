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
      <div className="hidden lg:flex flex-1 items-center justify-center bg-slate-950 p-10 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/15 to-cyan-600/8" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_50%,rgba(59,130,246,0.12),transparent_60%)]" />
        <div className="relative max-w-[300px] space-y-7">
          <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mx-auto backdrop-blur-sm border border-white/10 animate-float"><ShoppingCart className="w-7 h-7 text-blue-400" /></div>
          <h2 className="text-xl font-bold text-white leading-tight text-center">Join PC Parts Store</h2>
          <div className="space-y-2.5">
            {benefits.map((benefit) => (
              <div key={benefit} className="flex items-center gap-2.5 text-slate-400 text-[13px]">
                <div className="w-4.5 h-4.5 bg-emerald-500/10 rounded-full flex items-center justify-center flex-shrink-0"><Check className="w-2.5 h-2.5 text-emerald-400" /></div>
                {benefit}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-10">
        <div className="w-full max-w-[340px] animate-fade-in">
          <div className="mb-7">
            <Link href="/" className="flex items-center gap-2 mb-7">
              <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center shadow-sm shadow-blue-600/20"><ShoppingCart className="w-3.5 h-3.5 text-white" /></div>
              <span className="font-bold text-base text-slate-900">PC Parts</span>
            </Link>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Create your account</h1>
            <p className="text-slate-500 text-[13px] mt-0.5">Start shopping premium PC components</p>
          </div>
          <form onSubmit={handleRegister} className="space-y-3.5">
            <div><label className="block text-[11px] font-medium text-slate-700 mb-1">Email</label><Input type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={loading} className="h-9 text-[13px]" /></div>
            <div><label className="block text-[11px] font-medium text-slate-700 mb-1">Password</label><Input type="password" placeholder="At least 6 characters" value={password} onChange={(e) => setPassword(e.target.value)} required disabled={loading} className="h-9 text-[13px]" /></div>
            <div><label className="block text-[11px] font-medium text-slate-700 mb-1">Confirm Password</label><Input type="password" placeholder="Repeat your password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required disabled={loading} className="h-9 text-[13px]" /></div>
            <Button type="submit" className="w-full h-9 text-[13px] font-semibold bg-blue-600 hover:bg-blue-500 shadow-sm shadow-blue-600/20 btn-glow" disabled={loading}>
              {loading ? 'Creating account...' : 'Create Account'}{!loading && <ArrowRight className="w-3.5 h-3.5 ml-1" />}
            </Button>
          </form>
          <div className="mt-5 text-center"><p className="text-[13px] text-slate-500">Already have an account? <Link href="/login" className="text-blue-600 hover:text-blue-700 font-semibold">Sign in</Link></p></div>
        </div>
      </div>
    </div>
  );
}
