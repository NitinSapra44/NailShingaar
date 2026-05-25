import { Sparkles, Ruler, Heart, Truck } from 'lucide-react';

const features = [
  {
    icon: Sparkles,
    title: '100% Handcrafted',
    description: 'Every set is made by hand with precision and care — no mass production, ever.',
  },
  {
    icon: Ruler,
    title: 'Custom Sized',
    description: 'We size each nail to your fingers using the coin method for a perfect fit.',
  },
  {
    icon: Heart,
    title: 'Made with Love',
    description: 'Designed by Reet with attention to detail that salons simply cannot replicate.',
  },
  {
    icon: Truck,
    title: 'Pan India Delivery',
    description: 'Shipped safely across India. Free delivery on orders above ₹999.',
  },
];

// A curated strip of nail images shown as a visual gallery
const GALLERY = [
  'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=300&h=300&fit=crop',
  'https://images.unsplash.com/photo-1519014816548-bf5fe059798b?w=300&h=300&fit=crop',
  'https://images.unsplash.com/photo-1604655333-a4f000e8d9c0?w=300&h=300&fit=crop',
  'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=300&h=300&fit=crop&crop=right',
  'https://images.unsplash.com/photo-1519014816548-bf5fe059798b?w=300&h=300&fit=crop&crop=left',
  'https://images.unsplash.com/photo-1604655333-a4f000e8d9c0?w=300&h=300&fit=crop&crop=top',
];

const WhyChooseUs = () => {
  return (
    <>
      {/* ── Nail image gallery strip ─────────────────────────────── */}
      <section className="py-12 bg-muted/40 overflow-hidden">
        <div className="container mx-auto px-4">
          <p className="font-script text-center text-2xl text-primary mb-6">our work</p>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
            {GALLERY.map((src, i) => (
              <div
                key={src}
                className="aspect-square rounded-2xl overflow-hidden shadow-soft hover:shadow-card transition-shadow duration-300 group"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <img
                  src={src}
                  alt="Nail Shingaar handcrafted nail design"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Why choose us ───────────────────────────────────────── */}
      <section className="py-20 bg-background relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none opacity-30">
          <div className="absolute top-0 left-1/4 w-72 h-72 bg-rose-gold-light rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-champagne-light rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-14">
            <span className="font-script text-2xl text-primary">the difference</span>
            <h2 className="font-display text-3xl md:text-4xl font-semibold mt-1">
              Why <span className="text-gradient">Nail Shingaar</span>?
            </h2>
            <p className="mt-2 text-muted-foreground max-w-md mx-auto">
              Every set is crafted individually — because your hands deserve nothing less.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="group p-7 rounded-2xl bg-gradient-card shadow-soft hover:shadow-card transition-all duration-300 animate-fade-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-display text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default WhyChooseUs;
