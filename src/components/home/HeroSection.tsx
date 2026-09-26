import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, ArrowUpRight, Ruler, Sparkles, Truck, Star } from 'lucide-react';
import { Container, Accent } from '@/components/ui-kit';
import { Button } from '@/components/ui/button';

const TRUST = [
  { icon: Ruler, label: 'Custom fit' },
  { icon: Sparkles, label: 'Handcrafted' },
  { icon: Truck, label: 'Pan-India delivery' },
  { icon: Star, label: '5.0 on Google' },
];

// Real product photography; slugs point at the existing product pages.
const MOSAIC = [
  {
    name: 'White Garden',
    slug: 'white-garden',
    src: '/editorial/hero-white-garden.jpg',
    alt: 'Hands wearing White Garden press-on nails against an orange backdrop',
    className: 'col-span-2 aspect-[3/2] md:col-span-6',
    sizes: '(max-width: 768px) 100vw, 50vw',
    priority: true,
  },
  {
    name: 'Ivory Royale',
    slug: 'ivory-royale',
    src: '/editorial/hero-ivory-royale.jpg',
    alt: 'Model wearing Ivory Royale press-on nails with glitter makeup',
    className: 'aspect-[4/5] md:col-span-3',
    sizes: '(max-width: 768px) 50vw, 25vw',
    priority: false,
  },
  {
    name: 'Emerald Luxe',
    slug: 'emerald-luxe',
    src: '/editorial/hero-emerald-luxe.jpg',
    alt: 'Model wearing Emerald Luxe press-on nails, holding a chocolate bar',
    className: 'aspect-[4/5] md:col-span-3',
    sizes: '(max-width: 768px) 50vw, 25vw',
    priority: false,
  },
];

export default function HeroSection() {
  return (
    <section className="bg-background pb-14 pt-10 md:pb-20 md:pt-16">
      <Container>
        <div className="grid gap-8 lg:grid-cols-12 lg:items-end lg:gap-10">
          <div className="lg:col-span-8">
            <p className="eyebrow mb-6 flex items-center gap-3">
              <span aria-hidden className="h-px w-8 bg-foreground/30" />
              Handcrafted press-on nails · Ludhiana
            </p>
            <h1 className="type-display text-foreground">
              Crafting confidence, <Accent>one nail at a&nbsp;time.</Accent>
            </h1>
          </div>
          <div className="lg:col-span-4 lg:pb-3">
            <p className="max-w-md text-base leading-relaxed text-muted-foreground md:text-lg">
              Custom-sized, salon-quality press-ons made by hand — designed to fit your fingers perfectly.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Button asChild>
                <Link href="/categories">
                  Shop the Collection <ArrowRight aria-hidden />
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/custom-order">Create a Custom Set</Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Photo mosaic — each tile links to the product it shows */}
        <div className="mt-12 grid grid-cols-2 gap-3 md:mt-16 md:grid-cols-12 md:gap-4">
          {MOSAIC.map((t) => (
            <Link
              key={t.slug}
              href={`/product/${t.slug}`}
              className={`group relative overflow-hidden rounded-media bg-blush md:aspect-auto md:h-[480px] ${t.className}`}
            >
              <Image
                src={t.src}
                alt={t.alt}
                fill
                priority={t.priority}
                sizes={t.sizes}
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
              />
              <span className="absolute bottom-3 left-3 inline-flex items-center gap-1 rounded-full bg-background/90 px-3 py-1.5 text-xs font-semibold text-foreground backdrop-blur transition-colors group-hover:bg-foreground group-hover:text-background">
                {t.name} <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
              </span>
            </Link>
          ))}
        </div>

        <ul className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-3 border-t border-border pt-6 text-sm text-muted-foreground">
          {TRUST.map((t) => (
            <li key={t.label} className="flex items-center gap-2">
              <t.icon className="h-4 w-4 text-foreground" aria-hidden />
              {t.label}
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
