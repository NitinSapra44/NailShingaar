'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShoppingBag, User, Menu, X, Search, Heart, ChevronDown, Grid3X3, Sparkles, ArrowRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useAuth } from '@/hooks/useAuth';
import { useAdmin } from '@/hooks/useAdmin';
import { useCart } from '@/hooks/useCart';
import { useWishlist } from '@/hooks/useWishlist';
import { cn } from '@/lib/utils';
import type { Category } from '@/types';

const NAV_LINK =
  'relative text-sm font-medium text-foreground/80 transition-colors hover:text-foreground after:absolute after:-bottom-1 after:left-0 after:h-px after:w-full after:origin-left after:scale-x-0 after:bg-primary after:transition-transform after:duration-300 hover:after:scale-x-100';

const ICON_BTN =
  'relative inline-flex h-10 w-10 items-center justify-center rounded-full text-foreground transition-colors hover:bg-blush';

const CountBadge = ({ count }: { count: number }) =>
  count > 0 ? (
    <span className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground">
      {count}
    </span>
  ) : null;

const Header = () => {
  const { user } = useAuth();
  const { isAdmin } = useAdmin();
  const { totalItems } = useCart();
  const { items: wishlistItems } = useWishlist();
  const router = useRouter();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [collectionsOpen, setCollectionsOpen] = useState(false);
  const [mobileCollectionsOpen, setMobileCollectionsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  let accountHref = '/auth';
  if (user) accountHref = isAdmin ? '/admin' : '/orders';
  let accountLabel = 'Sign In';
  if (user) accountLabel = isAdmin ? 'Admin Panel' : 'My Orders';

  useEffect(() => {
    fetch('/api/categories')
      .then((res) => res.json())
      .then((data) => setCategories(data ?? []));
  }, []);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setCollectionsOpen(false);
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setCollectionsOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/shop?search=${encodeURIComponent(searchQuery)}`);
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  };

  const logo = (className: string) => (
    <Link href="/" className={cn('flex items-center', className)} aria-label="Nail Shingaar by Reet — home">
      <img src="/logo.png" alt="Nail Shingaar by Reet" className="h-10 w-auto object-contain md:h-12" />
    </Link>
  );

  const searchToggle = (
    <button
      type="button"
      className={ICON_BTN}
      onClick={() => setIsSearchOpen((o) => !o)}
      aria-label={isSearchOpen ? 'Close search' : 'Search'}
      aria-expanded={isSearchOpen}
      aria-controls="site-search"
    >
      {isSearchOpen ? <X className="h-5 w-5" /> : <Search className="h-5 w-5" />}
    </button>
  );

  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full border-b transition-[background-color,border-color] duration-300',
        scrolled ? 'border-border bg-ivory/85 backdrop-blur-md' : 'border-transparent bg-ivory',
      )}
    >
      <div className="container">
        <div className="flex h-16 items-center gap-2 md:h-[72px]">
          {/* Left: mobile menu + search / desktop logo */}
          <div className="flex flex-1 items-center gap-1 lg:flex-none">
            <Sheet>
              <SheetTrigger asChild>
                <button type="button" className={cn(ICON_BTN, 'lg:hidden')} aria-label="Open menu">
                  <Menu className="h-5 w-5" />
                </button>
              </SheetTrigger>
              <SheetContent side="left" aria-describedby={undefined} className="flex w-[86vw] max-w-sm flex-col overflow-y-auto border-r-0 bg-ivory p-0">
                <SheetTitle className="sr-only">Menu</SheetTitle>
                <div className="border-b border-border px-6 pb-5 pt-6">
                  <Link href="/" aria-label="Nail Shingaar by Reet — home">
                    <img src="/logo.png" alt="Nail Shingaar by Reet" className="h-12 w-auto object-contain" />
                  </Link>
                </div>

                <nav className="flex-1 px-6 py-4" aria-label="Mobile">
                  <Link href="/" className="block py-3 font-serif text-2xl text-foreground transition-colors hover:text-primary">Home</Link>
                  <Link href="/shop" className="block py-3 font-serif text-2xl text-foreground transition-colors hover:text-primary">Shop</Link>
                  <Accordion
                    type="single"
                    collapsible
                    value={mobileCollectionsOpen ? 'collections' : ''}
                    onValueChange={(v) => setMobileCollectionsOpen(v === 'collections')}
                  >
                    <AccordionItem value="collections" className="border-b-0">
                      <AccordionTrigger className="py-3 font-serif text-2xl font-medium">Collections</AccordionTrigger>
                      <AccordionContent className="pb-2">
                        <div className="flex flex-col border-l border-gold/60 pl-4">
                          <Link href="/categories" className="flex items-center gap-2 py-2 text-[15px] font-medium text-foreground hover:text-primary">
                            <Grid3X3 className="h-3.5 w-3.5 text-gold" aria-hidden /> All Collections
                          </Link>
                          {categories.map((cat) => (
                            <Link key={cat.id} href={`/categories/${cat.slug}`} className="py-2 text-[15px] text-muted-foreground hover:text-primary">
                              {cat.name}
                            </Link>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                  <Link href="/about" className="block py-3 font-serif text-2xl text-foreground transition-colors hover:text-primary">About</Link>
                  <Link href="/blog" className="block py-3 font-serif text-2xl text-foreground transition-colors hover:text-primary">Blog</Link>

                  <Link
                    href="/custom-order"
                    className="mt-5 flex items-center justify-between gap-3 rounded-card border border-gold/50 bg-surface p-4 transition-colors hover:border-primary"
                  >
                    <span className="flex items-center gap-3">
                      <Sparkles className="h-5 w-5 text-gold" aria-hidden />
                      <span>
                        <span className="block font-serif text-xl font-semibold text-foreground">Custom Order</span>
                        {/* TODO(copy): confirm drawer tagline */}
                        <span className="block text-xs text-muted-foreground">A set designed just for you</span>
                      </span>
                    </span>
                    <ArrowRight className="h-4 w-4 text-primary" aria-hidden />
                  </Link>
                </nav>

                <div className="border-t border-border px-6 py-5">
                  <Link href={accountHref} className="flex items-center gap-3 text-[15px] font-semibold text-foreground hover:text-primary">
                    <User className="h-5 w-5" aria-hidden />
                    {accountLabel}
                  </Link>
                </div>
              </SheetContent>
            </Sheet>
            <span className="lg:hidden">{searchToggle}</span>
            {logo('hidden lg:flex')}
          </div>

          {/* Centre: mobile logo / desktop nav */}
          {logo('lg:hidden')}
          <nav className="hidden flex-1 items-center justify-center gap-8 lg:flex" aria-label="Main">
            <Link href="/" className={NAV_LINK}>Home</Link>
            <Link href="/shop" className={NAV_LINK}>Shop</Link>

            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setCollectionsOpen(!collectionsOpen)}
                aria-expanded={collectionsOpen}
                aria-haspopup="true"
                className="flex items-center gap-1 text-sm font-medium text-foreground/80 transition-colors hover:text-foreground"
              >
                Collections
                <ChevronDown className={cn('h-3.5 w-3.5 transition-transform', collectionsOpen && 'rotate-180')} aria-hidden />
              </button>
              {collectionsOpen && (
                <div className="absolute left-1/2 top-full z-50 mt-4 w-72 -translate-x-1/2 animate-scale-in rounded-card border border-border bg-surface p-2 shadow-hover">
                  <Link
                    href="/categories"
                    onClick={() => setCollectionsOpen(false)}
                    className="flex items-center gap-2 rounded-media px-3 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-blush"
                  >
                    <Grid3X3 className="h-4 w-4 text-gold" aria-hidden /> All Collections
                  </Link>
                  <div className="mx-3 my-1 h-px bg-border" />
                  {categories.map((cat) => (
                    <Link
                      key={cat.id}
                      href={`/categories/${cat.slug}`}
                      onClick={() => setCollectionsOpen(false)}
                      className="flex items-center rounded-media px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-blush hover:text-foreground"
                    >
                      {cat.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <Link href="/about" className={NAV_LINK}>About</Link>
            <Link href="/blog" className={NAV_LINK}>Blog</Link>
          </nav>

          {/* Right: actions */}
          <div className="flex flex-1 items-center justify-end gap-0.5 lg:flex-none">
            <span className="hidden lg:inline-flex">{searchToggle}</span>
            <Link href="/wishlist" className={ICON_BTN} aria-label={`Wishlist (${wishlistItems.length} items)`}>
              <Heart className="h-5 w-5" aria-hidden />
              <CountBadge count={wishlistItems.length} />
            </Link>
            <Link href="/cart" className={ICON_BTN} aria-label={`Cart (${totalItems} items)`}>
              <ShoppingBag className="h-5 w-5" aria-hidden />
              <CountBadge count={totalItems} />
            </Link>
            <Link href={accountHref} className={cn(ICON_BTN, 'hidden lg:inline-flex')} aria-label={accountLabel}>
              <User className="h-5 w-5" aria-hidden />
            </Link>
            <Link
              href="/custom-order"
              className="ml-3 hidden h-10 items-center gap-2 rounded-full border border-foreground px-5 text-sm font-semibold text-foreground transition-colors hover:bg-foreground hover:text-background lg:inline-flex"
            >
              <Sparkles className="h-3.5 w-3.5 text-gold" aria-hidden /> Custom Order
            </Link>
          </div>
        </div>
      </div>

      {/* Search panel */}
      {isSearchOpen && (
        <div id="site-search" className="border-t border-border bg-ivory">
          <form onSubmit={handleSearch} className="container flex items-center gap-3 py-3" role="search">
            <Search className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
            <Input
              type="search"
              placeholder="Search nails..."
              aria-label="Search products"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-11 flex-1 rounded-full border-border bg-surface"
              autoFocus
            />
          </form>
        </div>
      )}
    </header>
  );
};

export default Header;
