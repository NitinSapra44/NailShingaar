import Link from 'next/link';
import { ArrowRight, Ruler, Sparkles, Truck, Star } from 'lucide-react';
import { Container, Accent } from '@/components/ui-kit';
import { Button } from '@/components/ui/button';
import { HeroVideo } from './HeroVideo';

const TRUST = [
  { icon: Ruler, label: 'Custom fit' },
  { icon: Sparkles, label: 'Handcrafted' },
  { icon: Truck, label: 'Pan-India delivery' },
  { icon: Star, label: '4.8 on Google' },
];

export default function HeroSection() {
  return (
    <section className="bg-background">
      {/* Full-bleed film. Sage fallback matches the footage while it loads. */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#A3AD98] sm:aspect-video md:max-h-[calc(100svh-7rem)]">
        <HeroVideo />
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 hidden h-2/5 bg-gradient-to-t from-ink/35 to-transparent md:block"
        />
        <div className="absolute bottom-5 left-5 z-10 hidden md:block lg:bottom-8 lg:left-8">
          <Button asChild className="bg-white text-foreground hover:bg-primary hover:text-white">
            <Link href="/categories">
              Shop the Collection <ArrowRight aria-hidden />
            </Link>
          </Button>
        </div>
      </div>

      <Container className="pb-14 pt-10 md:pb-20 md:pt-16">
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

        <ul className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-3 border-t border-border pt-6 text-sm text-muted-foreground">
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
