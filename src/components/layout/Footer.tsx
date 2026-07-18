'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Mail, Phone } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import type { Category } from '@/types';

const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none" />
  </svg>
);

const Footer = () => {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    supabase.from('categories').select('name, slug').order('name').then(({ data }) => {
      setCategories(data || []);
    });
  }, []);

  return (
    <footer className="bg-card border-t border-border">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" className="inline-block">
              <img src="/logo.png" alt="Nail Shingaar by Reet" className="h-14 w-auto object-contain" />
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Handcrafted custom press-on nails made with love. Every set is uniquely crafted to fit your fingers perfectly.
            </p>
            <div className="flex gap-3">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="h-9 w-9 rounded-full bg-pink-light flex items-center justify-center text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                <InstagramIcon />
              </a>
              <a
                href="mailto:nailshingaar@gmail.com"
                className="h-9 w-9 rounded-full bg-pink-light flex items-center justify-center text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                <Mail className="h-4 w-4" />
              </a>
              <a
                href="tel:+919569570825"
                className="h-9 w-9 rounded-full bg-pink-light flex items-center justify-center text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                <Phone className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Collections */}
          <div className="space-y-4">
            <h4 className="font-display text-lg font-semibold">Collections</h4>
            <nav className="flex flex-col gap-2">
              {categories.length > 0 ? categories.map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/categories/${cat.slug}`}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  {cat.name}
                </Link>
              )) : (
                <Link href="/categories" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  View All Collections
                </Link>
              )}
            </nav>
          </div>

          {/* Help */}
          <div className="space-y-4">
            <h4 className="font-display text-lg font-semibold">Help</h4>
            <nav className="flex flex-col gap-2">
              <Link href="/size-guide" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Size Guide (Coin Method)
              </Link>
              <Link href="/how-to-order" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                How to Order
              </Link>
              <Link href="/faq" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                FAQs
              </Link>
              <Link href="/shipping" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Shipping Info
              </Link>
              <Link href="/contact" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Contact Us
              </Link>
            </nav>
          </div>

          {/* Newsletter */}
          <div className="space-y-4">
            <h4 className="font-display text-lg font-semibold">Stay in the Loop</h4>
            <p className="text-sm text-muted-foreground">
              New collections, seasonal drops & styling inspiration — straight to your inbox.
            </p>
            <form className="flex flex-col gap-2">
              <input
                type="email"
                placeholder="your@email.com"
                className="px-4 py-2.5 text-sm rounded-full border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button
                type="submit"
                className="px-6 py-2.5 text-sm font-semibold rounded-full bg-primary text-primary-foreground hover:bg-pink-dark transition-colors shadow-soft"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Nail Shingaar by Reet. All rights reserved.</p>
          <p className="font-script text-base text-primary">Made with love, crafted for you ✦</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
