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
import { ShoppingCart, User, LogOut, Menu, X, Package, Settings, Search } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';

export function Navbar() {
  const { session, loading } = useAuth();
  const router = useRouter();
  const supabase = createClient();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (session) fetchCartCount();
    else setCartCount(0);
  }, [session]);

  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchOpen]);

  async function fetchCartCount() {
    const { data } = await supabase.from('cart_items').select('quantity').eq('user_id', session!.user.id);
    if (data) setCartCount(data.reduce((sum, item) => sum + item.quantity, 0));
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    toast.success('Logged out successfully');
    router.push('/');
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  }

  const navLinks = [
    { href: '/products', label: 'All Products' },
    { href: '/products?category=processors', label: 'CPUs' },
    { href: '/products?category=graphics-cards', label: 'GPUs' },
    { href: '/products?category=memory', label: 'RAM' },
    { href: '/products?category=storage', label: 'Storage' },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-slate-200/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center group-hover:bg-blue-700 transition-colors shadow-sm shadow-blue-600/20">
                <ShoppingCart className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-lg text-slate-900 tracking-tight hidden sm:block">PC Parts</span>
            </Link>
            <div className="hidden lg:flex items-center gap-0.5">
              {navLinks.map((link) => (
                <Link key={link.href} href={link.href} className="px-3 py-1.5 text-[13px] font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-md transition-colors">
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {searchOpen ? (
              <form onSubmit={handleSearch} className="flex items-center animate-fade-in">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search products..."
                    className="w-48 sm:w-64 pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
                    onBlur={() => { if (!searchQuery) setSearchOpen(false); }}
                  />
                </div>
                <button type="button" onClick={() => { setSearchOpen(false); setSearchQuery(''); }} className="ml-1 p-2 text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-50">
                  <X className="w-4 h-4" />
                </button>
              </form>
            ) : (
              <button onClick={() => setSearchOpen(true)} className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors">
                <Search className="w-5 h-5" />
              </button>
            )}

            <Link href="/cart" className="relative p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors">
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-blue-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-bounce-in shadow-sm shadow-blue-600/30">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </Link>

            {loading ? (
              <div className="w-8 h-8 bg-slate-100 rounded-full animate-pulse" />
            ) : session ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 p-1 hover:bg-slate-50 rounded-lg transition-colors ml-1">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center shadow-sm shadow-blue-600/20">
                      <User className="w-4 h-4 text-white" />
                    </div>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 p-2">
                  <div className="px-2 py-2 mb-1">
                    <p className="text-sm font-semibold text-slate-900">My Account</p>
                    <p className="text-xs text-slate-500 truncate mt-0.5">{session.user.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild className="rounded-md cursor-pointer">
                    <Link href="/profile" className="flex items-center gap-2.5 py-1.5"><Settings className="w-4 h-4 text-slate-400" /> Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="rounded-md cursor-pointer">
                    <Link href="/orders" className="flex items-center gap-2.5 py-1.5"><Package className="w-4 h-4 text-slate-400" /> Orders</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600 rounded-md cursor-pointer py-1.5">
                    <LogOut className="w-4 h-4 mr-2.5" /> Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-2 ml-1">
                <Link href="/login"><Button variant="ghost" size="sm" className="text-slate-600 text-[13px]">Sign In</Button></Link>
                <Link href="/register"><Button size="sm" className="text-[13px] shadow-sm shadow-blue-600/20">Register</Button></Link>
              </div>
            )}

            <button className="lg:hidden p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="lg:hidden py-3 space-y-0.5 border-t border-slate-200/60 animate-fade-in">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} className="block px-3 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors" onClick={() => setMobileMenuOpen(false)}>
                {link.label}
              </Link>
            ))}
            {!session && (
              <div className="pt-3 mt-2 space-y-2 border-t border-slate-200/60">
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
