'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Mail, Phone } from 'lucide-react';

const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none" />
  </svg>
);

const SOCIAL =
  'flex h-11 w-11 items-center justify-center rounded-full border border-gold/70 text-deep-foreground transition-colors hover:border-gold hover:bg-gold hover:text-deep';

const FOOTER_LINK = 'text-sm text-deep-foreground/75 transition-colors hover:text-deep-foreground';

const HELP_LINKS = [
  { href: '/blog', label: 'Blog' },
  { href: '/size-guide', label: 'Size Guide (Coin Method)' },
  { href: '/how-to-order', label: 'How to Order' },
  { href: '/faq', label: 'FAQs' },
  { href: '/shipping', label: 'Shipping Info' },
  { href: '/contact', label: 'Contact Us' },
];

const Footer = () => {
  const [categories, setCategories] = useState<{ name: string; slug: string }[]>([]);

  useEffect(() => {
    fetch('/api/categories')
      .then((res) => res.json())
      .then((data) => setCategories(data || []));
  }, []);

  return (
    <footer className="bg-deep text-deep-foreground">
      <div className="container pb-10 pt-16 md:pt-20">
        <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
          {/* Brand */}
          <div className="space-y-5">
            <Link href="/" className="inline-block" aria-label="Nail Shingaar by Reet — home">
              {/* TODO(asset): replace the CSS-inverted logo with a proper light/ivory logo file */}
              <img src="/logo.png" alt="Nail Shingaar by Reet" className="h-14 w-auto object-contain brightness-0 invert" />
            </Link>
            <p className="max-w-xs text-sm leading-relaxed text-deep-foreground/75">
              Handcrafted custom press-on nails made with love. Every set is uniquely crafted to fit your fingers perfectly.
            </p>
            <div className="flex gap-3">
              <a
                href="https://www.instagram.com/nailshingaar"
                target="_blank"
                rel="noopener noreferrer"
                className={SOCIAL}
                aria-label="Nail Shingaar on Instagram"
              >
                <InstagramIcon />
              </a>
              <a href="mailto:nailshingaar@gmail.com" className={SOCIAL} aria-label="Email nailshingaar@gmail.com">
                <Mail className="h-[18px] w-[18px]" aria-hidden />
              </a>
              <a href="tel:+919569570825" className={SOCIAL} aria-label="Call +91 95695 70825">
                <Phone className="h-[18px] w-[18px]" aria-hidden />
              </a>
            </div>
          </div>

          {/* Collections */}
          <nav className="space-y-4" aria-label="Collections">
            <h2 className="font-serif text-xl font-semibold text-deep-foreground">Collections</h2>
            <div className="flex flex-col gap-2.5">
              {categories.length > 0 ? (
                categories.map((cat) => (
                  <Link key={cat.slug} href={`/categories/${cat.slug}`} className={FOOTER_LINK}>
                    {cat.name}
                  </Link>
                ))
              ) : (
                <Link href="/categories" className={FOOTER_LINK}>
                  View All Collections
                </Link>
              )}
            </div>
          </nav>

          {/* Help */}
          <nav className="space-y-4" aria-label="Help">
            <h2 className="font-serif text-xl font-semibold text-deep-foreground">Help</h2>
            <div className="flex flex-col gap-2.5">
              {HELP_LINKS.map((l) => (
                <Link key={l.href} href={l.href} className={FOOTER_LINK}>
                  {l.label}
                </Link>
              ))}
            </div>
          </nav>

          {/* Contact */}
          <div className="space-y-4">
            <h2 className="font-serif text-xl font-semibold text-deep-foreground">Get in Touch</h2>
            <p className="text-sm leading-relaxed text-deep-foreground/75">
              Have a question or want a custom design? Reach out — Reet would love to hear from you.
            </p>
            <div className="flex flex-col gap-2.5 text-sm">
              <a href="mailto:nailshingaar@gmail.com" className={`flex items-center gap-2.5 ${FOOTER_LINK}`}>
                <Mail className="h-4 w-4 text-gold" aria-hidden /> nailshingaar@gmail.com
              </a>
              <a href="https://wa.me/919569570825" target="_blank" rel="noopener noreferrer" className={`flex items-center gap-2.5 ${FOOTER_LINK}`}>
                <Phone className="h-4 w-4 text-gold" aria-hidden /> +91 95695 70825
              </a>
            </div>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-3 border-t border-gold/30 pt-8 text-center text-sm text-deep-foreground/70 md:flex-row md:text-left">
          <p>© {new Date().getFullYear()} Nail Shingaar by Reet. All rights reserved.</p>
          <p className="font-serif text-lg italic text-deep-foreground">Made with love, crafted for you ✦</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
