import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

const steps = [
  {
    num: '01',
    title: 'CHOOSE YOUR DESIGN',
    desc: 'Browse 50+ styles or upload your own inspo. From bridal to everyday — there\'s a set for every version of you.',
  },
  {
    num: '02',
    title: 'SEND YOUR MEASUREMENTS',
    desc: 'Use our easy coin method to measure all 10 nails. Takes 2 minutes — we handle everything else.',
  },
  {
    num: '03',
    title: 'PRESS ON & SLAY',
    desc: 'Your custom set arrives ready to wear. Apply in 10 minutes. Salon finish from your bedroom.',
  },
];

const GALLERY = [
  '/Work/W-1.jpg',
  '/Work/W-2.jpg',
  '/Work/W-3.jpg',
  '/Work/W-4.jpg',
  '/Work/W-5.jpg',
  '/Work/W-6.jpg',
];

const WhyChooseUs = () => {
  return (
    <>
      {/* Dark "How It Works" */}
      <section className="py-24 bg-[#120710] relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full bg-primary/20 blur-[100px]" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full bg-primary/15 blur-[100px]" />
        </div>

        <div className="relative z-10 container mx-auto px-8 md:px-16">
          <div className="mb-16">
            <p className="text-[11px] font-bold tracking-[0.3em] text-primary uppercase mb-4">Your Path</p>
            <h2 className="font-display text-5xl md:text-7xl lg:text-8xl text-white leading-[0.9] tracking-tight">
              PERFECT<br />
              PRESS-ON<br />
              <span className="text-primary">NAILS.</span>
            </h2>
            <p className="mt-6 text-white/40 italic max-w-xs">
              Three simple steps to flawless, salon-quality nails at home.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-0 md:divide-x divide-white/10">
            {steps.map((step) => (
              <div key={step.num} className="md:px-10 first:pl-0 last:pr-0">
                <p className="font-display text-7xl text-white/8 mb-4 leading-none">{step.num}</p>
                <h3 className="font-display text-lg md:text-xl text-white mb-3 leading-tight">{step.title}</h3>
                <p className="text-sm text-white/45 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-14 pt-8 border-t border-white/10 flex items-center justify-between flex-wrap gap-4">
            <p className="text-white/30 text-sm">No prior experience needed. We guide you every step of the way.</p>
            <Link
              href="/how-to-order"
              className="inline-flex items-center gap-2 text-primary font-semibold text-sm hover:gap-3 transition-all"
            >
              See Full Guide <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Gallery strip */}
      <section className="py-14 bg-background overflow-hidden">
        <div className="container mx-auto px-4">
          <p className="text-[10px] font-bold tracking-[0.3em] text-muted-foreground uppercase text-center mb-8">
            Our Work
          </p>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
            {GALLERY.map((src, i) => (
              <div
                key={src + i}
                className="aspect-square rounded-2xl overflow-hidden shadow-soft hover:shadow-card transition-all duration-300 group"
              >
                <img
                  src={src}
                  alt="Nail Shingaar handcrafted design"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default WhyChooseUs;
