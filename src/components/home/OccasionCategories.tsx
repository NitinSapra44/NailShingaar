'use client';

import Link from 'next/link';

const occasions = [
  {
    name: 'Wedding',
    slug: 'indian-bridal-festive',
    image:
      'https://images.unsplash.com/photo-1519014816548-bf5fe059798b?w=500&h=700&fit=crop&q=80',
  },
  {
    name: 'Party',
    slug: 'basics-everyday',
    image:
      'https://images.unsplash.com/photo-1604655333-a4f000e8d9c0?w=500&h=700&fit=crop&q=80',
  },
  {
    name: 'Everyday',
    slug: 'basics-everyday',
    image:
      'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=500&h=700&fit=crop&q=80',
  },
  {
    name: 'Festive',
    slug: 'indian-bridal-festive',
    image:
      'https://images.unsplash.com/photo-1610992015762-45dca7fa3a85?w=500&h=700&fit=crop&q=80',
  },
  {
    name: 'Work',
    slug: 'basics-everyday',
    image:
      'https://images.unsplash.com/photo-1607779097040-26e80aa78e66?w=500&h=700&fit=crop&q=80',
  },
];

const OccasionCategories = () => {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <p className="text-xs font-semibold tracking-[0.25em] text-muted-foreground uppercase mb-2">Find Yours</p>
          <h2 className="font-display text-4xl md:text-6xl">
            Nails For Every <span className="text-gradient">Occasion</span>
          </h2>
          <p className="mt-3 text-muted-foreground italic">
            From boardroom to bridal — we have a set for every chapter
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 md:gap-4">
          {occasions.map((occ, i) => (
            <Link
              key={occ.name}
              href={`/categories/${occ.slug}`}
              className="group relative aspect-[3/4] rounded-2xl overflow-hidden shadow-soft hover:shadow-card transition-all duration-300 animate-fade-up"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <img
                src={occ.image}
                alt={occ.name}
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-foreground/10 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4 text-center">
                <span className="font-display text-white text-lg font-semibold tracking-wide drop-shadow">
                  {occ.name}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default OccasionCategories;
