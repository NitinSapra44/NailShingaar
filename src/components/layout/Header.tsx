'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShoppingBag, User, Menu, X, Search, Heart, ChevronDown, Grid3X3, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useAuth } from '@/hooks/useAuth';
import { useAdmin } from '@/hooks/useAdmin';
import { useCart } from '@/hooks/useCart';
import { supabase } from '@/integrations/supabase/client';
import type { Category } from '@/types';

const Header = () => {
  const { user } = useAuth();
  const { isAdmin } = useAdmin();
  const { totalItems } = useCart();
  const router = useRouter();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [collectionsOpen, setCollectionsOpen] = useState(false);
  const [mobileCollectionsOpen, setMobileCollectionsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  let accountHref = '/auth';
  if (user) accountHref = isAdmin ? '/admin' : '/orders';

  useEffect(() => {
    supabase.from('categories').select('*').order('name').then(({ data }) => {
      setCategories(data ?? []);
    });
  }, []);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setCollectionsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/shop?search=${encodeURIComponent(searchQuery)}`);
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-background">
      <div className="bg-primary text-primary-foreground text-center text-xs py-1.5 tracking-wide font-medium">
        Handcrafted with love · Custom sizing for every hand · Free shipping above ₹999
      </div>

      <div className="mx-4 md:mx-8 mt-2 mb-2 bg-card/98 backdrop-blur-md rounded-2xl shadow-soft border border-border/40 px-4 md:px-6">
        <div className="flex h-14 items-center justify-between">

          {/* Mobile menu */}
          <Sheet>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="ghost" size="icon"><Menu className="h-5 w-5" /></Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[280px] overflow-y-auto">
              <div className="mt-6 mb-8">
                <Link href="/"><img src="/logo.png" alt="Nail Shingaar by Reet" className="h-12 w-auto object-contain" /></Link>
              </div>
              <nav className="flex flex-col gap-1">
                <Link href="/" className="px-3 py-2.5 text-base font-medium text-foreground hover:text-primary hover:bg-pink-light/40 rounded-lg transition-colors">Home</Link>
                <Link href="/shop" className="px-3 py-2.5 text-base font-medium text-foreground hover:text-primary hover:bg-pink-light/40 rounded-lg transition-colors">Shop</Link>
                <button
                  onClick={() => setMobileCollectionsOpen(!mobileCollectionsOpen)}
                  className="flex items-center justify-between px-3 py-2.5 text-base font-medium text-foreground hover:text-primary hover:bg-pink-light/40 rounded-lg transition-colors w-full text-left">
                  Collections
                  <ChevronDown className={`h-4 w-4 transition-transform ${mobileCollectionsOpen ? 'rotate-180' : ''}`} />
                </button>
                {mobileCollectionsOpen && (
                  <div className="pl-4 flex flex-col gap-0.5">
                    <Link href="/categories" className="px-3 py-2 text-sm text-muted-foreground hover:text-primary rounded-lg transition-colors flex items-center gap-2">
                      <Grid3X3 className="h-3.5 w-3.5" /> All Collections
                    </Link>
                    {categories.map((cat) => (
                      <Link key={cat.id} href={`/categories/${cat.slug}`}
                        className="px-3 py-2 text-sm text-muted-foreground hover:text-primary rounded-lg transition-colors">
                        {cat.name}
                      </Link>
                    ))}
                  </div>
                )}
                <Link href="/about" className="px-3 py-2.5 text-base font-medium text-foreground hover:text-primary hover:bg-pink-light/40 rounded-lg transition-colors">About</Link>
                <Link href="/custom-order" className="flex items-center gap-2 px-3 py-2.5 text-base font-medium text-primary hover:bg-pink-light/40 rounded-lg transition-colors">
                  <Sparkles className="h-4 w-4" /> Custom Order
                </Link>
              </nav>
              <div className="mt-8 pt-8 border-t border-border">
                <Link href={accountHref} className="flex items-center gap-3 px-3 py-2.5 text-base font-medium text-foreground hover:text-primary hover:bg-pink-light/40 rounded-lg transition-colors">
                  <User className="h-5 w-5" />
                  {!user && 'Sign In'}
                  {user && isAdmin && 'Admin Panel'}
                  {user && !isAdmin && 'My Orders'}
                </Link>
              </div>
            </SheetContent>
          </Sheet>

          {/* Logo */}
          <Link href="/" className="flex items-center">
            <img src="/logo.png" alt="Nail Shingaar by Reet" className="h-10 md:h-12 w-auto object-contain" />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-8">
            <Link href="/" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors relative group">
              {"Home"}<span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full rounded-full" />
            </Link>
            <Link href="/shop" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors relative group">
              {"Shop"}<span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full rounded-full" />
            </Link>

            <div className="relative" ref={dropdownRef}>
              <button onClick={() => setCollectionsOpen(!collectionsOpen)}
                className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Collections
                <ChevronDown className={`h-3.5 w-3.5 transition-transform ${collectionsOpen ? 'rotate-180' : ''}`} />
              </button>
              {collectionsOpen && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-72 rounded-2xl bg-card border border-border shadow-card p-2 z-50">
                  <Link href="/categories" onClick={() => setCollectionsOpen(false)}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold text-primary hover:bg-pink-light transition-colors mb-1">
                    <Grid3X3 className="h-4 w-4" /> All Collections
                  </Link>
                  <div className="h-px bg-border mb-1" />
                  {categories.map((cat) => (
                    <Link key={cat.id} href={`/categories/${cat.slug}`}
                      onClick={() => setCollectionsOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-muted-foreground hover:text-primary hover:bg-pink-light/50 transition-colors">
                      {cat.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <Link href="/about" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors relative group">
              {"About"}<span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full rounded-full" />
            </Link>
            <Link href="/custom-order"
              className="flex items-center gap-1.5 text-sm font-semibold text-primary bg-pink-light hover:bg-pink-light/80 px-3.5 py-1.5 rounded-full transition-colors">
              <Sparkles className="h-3.5 w-3.5" /> Custom Order
            </Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-1">
            {isSearchOpen ? (
              <form onSubmit={handleSearch} className="flex items-center gap-2">
                <Input type="search" placeholder="Search nails..." value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-32 md:w-48 h-9 rounded-full" autoFocus />
                <Button type="button" variant="ghost" size="icon" onClick={() => setIsSearchOpen(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </form>
            ) : (
              <Button variant="ghost" size="icon" onClick={() => setIsSearchOpen(true)}>
                <Search className="h-5 w-5" />
              </Button>
            )}
            <Button variant="ghost" size="icon" asChild>
              <Link href="/wishlist"><Heart className="h-5 w-5" /></Link>
            </Button>
            <Button variant="ghost" size="icon" className="relative" asChild>
              <Link href="/cart">
                <ShoppingBag className="h-5 w-5" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-semibold shadow-soft">
                    {totalItems}
                  </span>
                )}
              </Link>
            </Button>
            <Button variant="ghost" size="icon" asChild className="hidden lg:flex">
              <Link href={accountHref}><User className="h-5 w-5" /></Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
