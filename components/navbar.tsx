'use client';

import { useAuth } from '@/lib/auth-context';
import { createClient } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ShoppingCart, User, LogOut, Menu, X, Package, Settings } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

export function Navbar() {
  const { session, loading } = useAuth();
  const router = useRouter();
  const supabase = createClient();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    if (session) fetchCartCount();
    else setCartCount(0);
  }, [session]);

  async function fetchCartCount() {
    const { data } = await supabase.from('cart_items').select('quantity').eq('user_id', session!.user.id);
    if (data) setCartCount(data.reduce((sum, item) => sum + item.quantity, 0));
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    toast.success('Logged out successfully');
    router.push('/');
  }

  const navLinks = [
    { href: '/products', label: 'All Products' },
    { href: '/products?category=processors', label: 'CPUs' },
    { href: '/products?category=graphics-cards', label: 'GPUs' },
    { href: '/products?category=memory', label: 'RAM' },
    { href: '/products?category=storage', label: 'Storage' },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center group-hover:bg-blue-700 transition-colors">
              <ShoppingCart className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg text-slate-900 tracking-tight">PC Parts</span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} className="px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors">
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <Link href="/cart" className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors">
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-blue-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-scale-in">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </Link>

            {loading ? (
              <div className="w-8 h-8 bg-slate-200 rounded-full animate-pulse" />
            ) : session ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 p-1.5 hover:bg-slate-50 rounded-lg transition-colors">
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-white" />
                    </div>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-medium text-slate-900">My Account</p>
                    <p className="text-xs text-slate-500 truncate">{session.user.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="flex items-center gap-2 cursor-pointer">
                      <Settings className="w-4 h-4" /> Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/orders" className="flex items-center gap-2 cursor-pointer">
                      <Package className="w-4 h-4" /> Orders
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600 cursor-pointer">
                    <LogOut className="w-4 h-4 mr-2" /> Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login"><Button variant="ghost" size="sm" className="text-slate-600">Sign In</Button></Link>
                <Link href="/register"><Button size="sm">Register</Button></Link>
              </div>
            )}

            <button className="md:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden py-4 space-y-1 border-t border-slate-200 animate-fade-in">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} className="block px-3 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors" onClick={() => setMobileMenuOpen(false)}>
                {link.label}
              </Link>
            ))}
            {!session && (
              <div className="pt-4 space-y-2 border-t border-slate-200 mt-2">
                <Link href="/login" className="block" onClick={() => setMobileMenuOpen(false)}><Button variant="outline" className="w-full">Sign In</Button></Link>
                <Link href="/register" className="block" onClick={() => setMobileMenuOpen(false)}><Button className="w-full">Register</Button></Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
