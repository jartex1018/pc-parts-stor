'use client';

import { useAuth } from '@/lib/auth-context';
import { createClient } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ShoppingCart, User, LogOut, Menu } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

export function Navbar() {
  const { session, loading } = useAuth();
  const router = useRouter();
  const supabase = createClient();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  async function handleLogout() {
    await supabase.auth.signOut();
    toast.success('Logged out successfully');
    router.push('/');
  }

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-bold text-xl text-slate-900">
            <ShoppingCart className="w-6 h-6 text-blue-600" />
            PC Parts
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <Link href="/products" className="text-slate-600 hover:text-slate-900 font-medium text-sm">
              Products
            </Link>
            <Link href="/products?category=processors" className="text-slate-600 hover:text-slate-900 font-medium text-sm">
              CPUs
            </Link>
            <Link href="/products?category=graphics-cards" className="text-slate-600 hover:text-slate-900 font-medium text-sm">
              GPUs
            </Link>
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-4">
            <Link href="/cart" className="text-slate-600 hover:text-slate-900">
              <ShoppingCart className="w-5 h-5" />
            </Link>

            {loading ? (
              <div className="w-10 h-10 bg-slate-200 rounded-full animate-pulse" />
            ) : session ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <User className="w-5 h-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href="/profile">Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/orders">Orders</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href="/login">
                <Button size="sm">Sign In</Button>
              </Link>
            )}

            {/* Mobile Menu */}
            <button
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 space-y-2 border-t border-slate-200">
            <Link href="/products" className="block px-4 py-2 text-slate-600 hover:bg-slate-100 rounded">
              Products
            </Link>
            <Link href="/products?category=processors" className="block px-4 py-2 text-slate-600 hover:bg-slate-100 rounded">
              CPUs
            </Link>
            <Link href="/products?category=graphics-cards" className="block px-4 py-2 text-slate-600 hover:bg-slate-100 rounded">
              GPUs
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
