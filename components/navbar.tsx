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
import { ShoppingCart, User, LogOut, Menu, X, Package, Settings, Search, Cpu, Monitor, MemoryStick, HardDrive } from 'lucide-react';
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
  const [scrolled, setScrolled] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (session) fetchCartCount();
    else setCartCount(0);
  }, [session]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (searchOpen && searchInputRef.current) searchInputRef.current.focus();
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
    { href: '/products', label: 'All Products', icon: null },
    { href: '/products?category=processors', label: 'CPUs', icon: Cpu },
    { href: '/products?category=graphics-cards', label: 'GPUs', icon: Monitor },
    { href: '/products?category=memory', label: 'RAM', icon: MemoryStick },
    { href: '/products?category=storage', label: 'Storage', icon: HardDrive },
  ];

  return (
    <nav className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/95 shadow-sm shadow-slate-200/50' : 'bg-white/80'} glass border-b ${scrolled ? 'border-slate-200/80' : 'border-slate-200/40'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14">
          <div className="flex items-center gap-7">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center shadow-sm shadow-blue-600/25 group-hover:shadow-blue-600/40 transition-shadow">
                <ShoppingCart className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-[17px] text-slate-900 tracking-tight hidden sm:block">PC Parts</span>
            </Link>
            <div className="hidden lg:flex items-center gap-0.5">
              {navLinks.map((link) => (
                <Link key={link.href} href={link.href} className="flex items-center gap-1.5 px-2.5 py-1.5 text-[13px] font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-md transition-colors">
                  {link.icon && <link.icon className="w-3.5 h-3.5" />}
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-1">
            {searchOpen ? (
              <form onSubmit={handleSearch} className="flex items-center animate-fade-in">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search products..."
                    className="w-52 sm:w-64 pl-9 pr-3 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                    onBlur={() => { if (!searchQuery) setSearchOpen(false); }}
                  />
                </div>
                <button type="button" onClick={() => { setSearchOpen(false); setSearchQuery(''); }} className="ml-1 p-1.5 text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-50 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </form>
            ) : (
              <button onClick={() => setSearchOpen(true)} className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors" title="Search">
                <Search className="w-[18px] h-[18px]" />
              </button>
            )}

            <Link href="/cart" className="relative p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors" title="Cart">
              <ShoppingCart className="w-[18px] h-[18px]" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-[16px] bg-blue-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center animate-bounce-in shadow-sm shadow-blue-600/30">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </Link>

            {loading ? (
              <div className="w-7 h-7 bg-slate-100 rounded-full animate-pulse ml-1" />
            ) : session ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 p-0.5 hover:bg-slate-50 rounded-lg transition-colors ml-0.5 group">
                    <div className="w-7 h-7 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center shadow-sm shadow-blue-600/20 group-hover:shadow-blue-600/30 transition-shadow">
                      <User className="w-3.5 h-3.5 text-white" />
                    </div>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52 p-1.5 shadow-xl shadow-slate-200/50 border-slate-200/80 rounded-xl">
                  <div className="px-2.5 py-2 mb-1">
                    <p className="text-xs font-semibold text-slate-900">My Account</p>
                    <p className="text-[11px] text-slate-500 truncate mt-0.5">{session.user.email}</p>
                  </div>
                  <DropdownMenuSeparator className="bg-slate-100" />
                  <DropdownMenuItem asChild className="rounded-lg cursor-pointer text-sm py-1.5 px-2.5">
                    <Link href="/profile" className="flex items-center gap-2"><Settings className="w-3.5 h-3.5 text-slate-400" /> Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="rounded-lg cursor-pointer text-sm py-1.5 px-2.5">
                    <Link href="/orders" className="flex items-center gap-2"><Package className="w-3.5 h-3.5 text-slate-400" /> Orders</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-slate-100" />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600 rounded-lg cursor-pointer text-sm py-1.5 px-2.5">
                    <LogOut className="w-3.5 h-3.5 mr-2" /> Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-1.5 ml-1">
                <Link href="/login"><Button variant="ghost" size="sm" className="text-slate-600 text-[13px] h-8">Sign In</Button></Link>
                <Link href="/register"><Button size="sm" className="text-[13px] h-8 shadow-sm shadow-blue-600/20 btn-glow">Register</Button></Link>
              </div>
            )}

            <button className="lg:hidden p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors ml-0.5" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="lg:hidden py-2 space-y-0.5 border-t border-slate-200/40 animate-fade-in">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors" onClick={() => setMobileMenuOpen(false)}>
                {link.icon && <link.icon className="w-4 h-4 text-slate-400" />}
                {link.label}
              </Link>
            ))}
            {!session && (
              <div className="pt-2 mt-2 space-y-1.5 border-t border-slate-200/40">
                <Link href="/login" className="block" onClick={() => setMobileMenuOpen(false)}><Button variant="outline" className="w-full h-9">Sign In</Button></Link>
                <Link href="/register" className="block" onClick={() => setMobileMenuOpen(false)}><Button className="w-full h-9 btn-glow">Register</Button></Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
