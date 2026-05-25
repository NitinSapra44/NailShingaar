'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ArrowRight, Star, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const slides = [
  {
    src: 'https://images.unsplash.com/photo-1696341980130-4bdff3322802?w=1200&auto=format&fit=crop&q=85',
    alt: 'Press-on nail sets collection',
    label: 'New Collection',
  },
  {
    src: 'https://images.unsplash.com/photo-1607779097040-26e80aa78e66?w=1200&auto=format&fit=crop&q=85',
    alt: 'Pink press-on nails on white textile',
    label: 'Everyday Glam',
  },
  {
    src: 'https://images.unsplash.com/photo-1519014816548-bf5fe059798b?w=1200&auto=format&fit=crop&q=85',
    alt: 'Close-up pink manicure',
    label: 'Custom Sets',
  },
  {
    src: 'https://images.unsplash.com/photo-1610992015762-45dca7fa3a85?w=1200&auto=format&fit=crop&q=85',
    alt: 'Polished nails lifestyle shot',
    label: 'Bridal & Festive',
  },
  {
    src: 'https://images.unsplash.com/photo-1610992015836-7c249d75782d?w=1200&auto=format&fit=crop&q=85',
    alt: 'Elegant manicured hands',
    label: 'Western Collection',
  },
];

const HeroSection = () => {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);

  const next = useCallback(() => setCurrent((c) => (c + 1) % slides.length), []);
  const prev = useCallback(() => setCurrent((c) => (c - 1 + slides.length) % slides.length), []);

  useEffect(() => {
    if (paused) return;
    const t = setInterval(next, 3800);
    return () => clearInterval(t);
  }, [paused, next]);

  return (
    <section className="relative min-h-screen flex flex-col lg:flex-row overflow-hidden">

      {/* ── LEFT: Content ── */}
      <div className="flex-1 flex items-center justify-center px-8 md:px-14 py-24 lg:py-0 bg-background order-2 lg:order-1 z-10">
        <div className="max-w-lg w-full">

          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary mb-8">
            <Sparkles className="h-3.5 w-3.5 shrink-0" />
            <span className="text-[11px] font-semibold tracking-[0.18em] uppercase">
              Custom Press-On Nails · Handcrafted
            </span>
          </div>

          {/* Heading */}
          <h1 className="font-display text-5xl md:text-6xl lg:text-[4.5rem] font-semibold text-foreground leading-[1.05] mb-3">
            Your Nails,
          </h1>
          <h1
            className="font-script text-5xl md:text-6xl lg:text-[4.5rem] leading-[1.15] mb-6"
            style={{ color: '#B3557D' }}
          >
            Your Story
          </h1>

          <p className="text-muted-foreground text-base md:text-lg leading-relaxed mb-10 max-w-sm">
            Handcrafted press-on nails sized to fit YOUR fingers — no salon, no wait. Shop ready-made sets or order a custom design.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap gap-4 mb-12">
            <Button asChild size="lg" className="rounded-full px-8 shadow-md text-sm font-semibold">
              <Link href="/shop">
                Shop Now
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="rounded-full px-8 border-primary/30 text-sm font-semibold hover:bg-primary/8"
            >
              <Link href="/categories">View Collections</Link>
            </Button>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-6 pt-6 border-t border-border">
            <div>
              <p className="font-display text-2xl font-semibold text-foreground">100%</p>
              <p className="text-[11px] text-muted-foreground tracking-widest uppercase mt-0.5">Handmade</p>
            </div>
            <div className="h-8 w-px bg-border" />
            <div>
              <p className="font-display text-2xl font-semibold text-foreground">Custom</p>
              <p className="text-[11px] text-muted-foreground tracking-widest uppercase mt-0.5">Sizing</p>
            </div>
            <div className="h-8 w-px bg-border" />
            <div>
              <div className="flex gap-0.5 mb-1">
                {[1, 2, 3, 4, 5].map((k) => (
                  <Star key={k} className="h-3.5 w-3.5" style={{ fill: '#B3557D', color: '#B3557D' }} />
                ))}
              </div>
              <p className="text-[11px] text-muted-foreground tracking-widest uppercase">5-Star Rated</p>
            </div>
          </div>

        </div>
      </div>

      {/* ── RIGHT: Image Carousel ── */}
      {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions */}
      <section
        aria-label="Product image carousel"
        aria-roledescription="carousel"
        className="relative w-full lg:w-[52%] h-[60vh] lg:h-auto order-1 lg:order-2 overflow-hidden"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        {/* Slides */}
        {slides.map((slide, i) => (
          <div
            key={slide.label}
            aria-label={slide.alt}
            className="absolute inset-0 transition-opacity duration-700"
            style={{ opacity: i === current ? 1 : 0 }}
          >
            <img
              src={slide.src}
              alt={slide.alt}
              className="w-full h-full object-cover object-center"
            />
          </div>
        ))}

        {/* Left blend edge */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'linear-gradient(to right, hsl(30 22% 89% / 0.55) 0%, transparent 22%)',
          }}
        />

        {/* Slide label */}
        <div className="absolute top-6 left-6 px-4 py-2 rounded-full bg-primary text-primary-foreground text-xs font-semibold tracking-widest uppercase shadow-lg transition-all duration-500">
          ✦ {slides[current].label}
        </div>

        {/* Prev / Next arrows */}
        <button
          onClick={prev}
          className="absolute left-4 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/70 backdrop-blur-sm flex items-center justify-center shadow-md hover:bg-white/90 transition-all"
          aria-label="Previous"
        >
          <ChevronLeft className="h-5 w-5 text-foreground" />
        </button>
        <button
          onClick={next}
          className="absolute right-4 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/70 backdrop-blur-sm flex items-center justify-center shadow-md hover:bg-white/90 transition-all"
          aria-label="Next"
        >
          <ChevronRight className="h-5 w-5 text-foreground" />
        </button>

        {/* Dot indicators */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
          {slides.map((slide, i) => (
            <button
              key={slide.label}
              onClick={() => setCurrent(i)}
              className="transition-all duration-300 rounded-full"
              style={{
                width: i === current ? '24px' : '8px',
                height: '8px',
                background: i === current ? '#B3557D' : 'rgba(255,255,255,0.65)',
              }}
              aria-label={`Go to slide ${i + 1}: ${slide.label}`}
              aria-current={i === current ? 'true' : undefined}
            />
          ))}
        </div>

        {/* Bottom info card */}
        <div className="absolute bottom-16 right-6 px-5 py-4 rounded-2xl bg-white/80 backdrop-blur-md border border-white/60 shadow-xl hidden lg:block">
          <p className="font-display text-sm font-semibold text-foreground">50+ Designs</p>
          <p className="text-xs text-muted-foreground mt-0.5">New sets added weekly ✦</p>
        </div>

      </section>

    </section>
  );
};

export default HeroSection;
