'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

const HeroSection = () => {
  return (
    <section className="relative min-h-screen bg-primary overflow-hidden flex items-center">
      {/* Decorative circles */}
      <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-white/10 pointer-events-none" />
      <div className="absolute -bottom-52 -left-52 w-[700px] h-[700px] rounded-full bg-white/8 pointer-events-none" />
      <div className="absolute top-1/3 left-1/2 w-40 h-40 rounded-full bg-white/5 pointer-events-none" />

      <div className="relative z-10 w-full px-8 md:px-16 lg:px-24 py-28 grid grid-cols-1 lg:grid-cols-[58%_42%] gap-12 items-center">
        {/* Left: Text */}
        <div>
          <div className="mb-8">
            <span className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/20 text-white text-[11px] font-bold tracking-[0.25em] uppercase border border-white/25">
              ✦ HANDMADE IN INDIA
            </span>
          </div>

          <div className="mb-8 space-y-0">
            <h1 className="font-display text-[4rem] sm:text-[5.5rem] md:text-[7rem] lg:text-[8rem] xl:text-[9.5rem] text-white leading-[0.87] tracking-[-0.03em]">
              MADE FOR
            </h1>
            <h1 className="font-display text-[4rem] sm:text-[5.5rem] md:text-[7rem] lg:text-[8rem] xl:text-[9.5rem] text-white/75 leading-[0.87] tracking-[-0.03em]">
              YOUR
            </h1>
            <h1 className="font-display text-[4rem] sm:text-[5.5rem] md:text-[7rem] lg:text-[8rem] xl:text-[9.5rem] text-white leading-[0.87] tracking-[-0.03em]">
              HANDS.
            </h1>
          </div>

          <p className="text-white/70 text-base md:text-lg max-w-md leading-relaxed mb-10">
            Custom-sized press-on nails crafted just for your fingers.
            No salon. No glue fumes. No waiting.
          </p>

          <div className="flex flex-wrap gap-4 mb-14">
            <Link
              href="/shop"
              className="inline-flex items-center gap-2.5 bg-white text-primary font-bold text-sm px-8 py-4 rounded-full shadow-lg hover:bg-white/90 transition-colors"
            >
              Shop Now
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/custom-order"
              className="inline-flex items-center gap-2.5 text-white font-semibold text-sm px-8 py-4 rounded-full border-2 border-white/35 hover:bg-white/10 transition-colors"
            >
              Custom Order
            </Link>
          </div>

          <div className="flex items-center gap-6 pt-6 border-t border-white/20">
            <div>
              <p className="font-display text-2xl md:text-3xl text-white">1000+</p>
              <p className="text-[10px] text-white/55 tracking-widest uppercase mt-0.5">Happy Clients</p>
            </div>
            <div className="h-8 w-px bg-white/20" />
            <div>
              <p className="font-display text-2xl md:text-3xl text-white">Custom</p>
              <p className="text-[10px] text-white/55 tracking-widest uppercase mt-0.5">Sizing</p>
            </div>
            <div className="h-8 w-px bg-white/20" />
            <div>
              <p className="font-display text-2xl md:text-3xl text-white">50+</p>
              <p className="text-[10px] text-white/55 tracking-widest uppercase mt-0.5">Designs</p>
            </div>
          </div>
        </div>

        {/* Right: Image with floating labels */}
        <div className="relative hidden lg:flex justify-center">
          <div className="relative w-[340px] xl:w-[390px]">
            <img
              src="https://images.unsplash.com/photo-1519014816548-bf5fe059798b?w=800&h=960&fit=crop&q=80"
              alt="Handcrafted custom press-on nails by Nail Shingaar"
              className="w-full rounded-[2rem] shadow-2xl"
            />

            {/* Floating chips */}
            <div className="absolute -top-3 -left-10 bg-white rounded-full px-4 py-2 shadow-lg">
              <span className="text-[11px] font-bold text-primary tracking-wider">HANDMADE ✦</span>
            </div>
            <div className="absolute top-1/3 -right-12 bg-white rounded-full px-4 py-2 shadow-lg">
              <span className="text-[11px] font-bold text-foreground tracking-wider">CUSTOM FIT</span>
            </div>
            <div className="absolute -bottom-3 left-1/3 bg-[#1A0A10] text-white rounded-full px-4 py-2 shadow-lg">
              <span className="text-[11px] font-bold tracking-wider">REUSABLE ✦</span>
            </div>
            <div className="absolute bottom-1/3 -left-12 bg-white rounded-full px-4 py-2 shadow-lg">
              <span className="text-[11px] font-bold text-foreground tracking-wider">SALON QUALITY</span>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile image accent */}
      <div className="lg:hidden absolute bottom-0 right-0 w-32 h-44 overflow-hidden rounded-tl-2xl opacity-25 pointer-events-none">
        <img
          src="https://images.unsplash.com/photo-1519014816548-bf5fe059798b?w=400&h=500&fit=crop"
          alt=""
          className="w-full h-full object-cover"
        />
      </div>
    </section>
  );
};

export default HeroSection;
