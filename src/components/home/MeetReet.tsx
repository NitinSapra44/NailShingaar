import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Section, Reveal } from '@/components/ui-kit';
import { Button } from '@/components/ui/button';

// Stats are facts already published on the site (About page + Google reviews section).
const STATS = [
  { value: '7+', label: 'Years of Experience' },
  { value: '1000+', label: 'Happy Clients' },
  { value: '5.0', label: 'Google Rating' },
];

export default function MeetReet() {
  return (
    <Section tone="soft">
      <div className="grid items-center gap-10 md:grid-cols-2 md:gap-14 lg:gap-20">
        <Reveal className="relative mx-auto w-full max-w-md md:max-w-none">
          <div className="relative aspect-[4/5] overflow-hidden rounded-card">
            <Image
              src="/reet-photo.jpg"
              alt="Reet Rajpal, nail artist and founder of Nail Shingaar, holding a Nail Shingaar gift bag"
              fill
              sizes="(max-width: 768px) 90vw, 45vw"
              className="object-cover object-[50%_35%]"
            />
          </div>
          <div className="pointer-events-none absolute -bottom-4 -right-4 hidden h-28 w-28 rounded-full border border-gold md:block" aria-hidden />
        </Reveal>

        <Reveal delay={80}>
          <p className="eyebrow mb-3">The Artist</p>
          <h2 className="type-h2 text-foreground">Meet Reet</h2>
          {/* TODO(copy): adapted to third person from the About page "My Story" — confirm wording with Reet */}
          <div className="mt-6 space-y-4 text-muted-foreground">
            <p>
              With more than 7 years of experience and a portfolio that showcases her mastery of cutting-edge
              techniques, Reet has established herself as a well-known and respected nail technician and educator.
            </p>
            <p>
              Every press-on set is handmade for every mood &amp; occasion — from soft everyday looks to bold glam
              designs — made with love, detail, and a little bit of shingaar.
            </p>
          </div>

          <dl className="mt-8 grid grid-cols-3 divide-x divide-gold/40 border-y border-gold/40 py-6">
            {STATS.map((s) => (
              <div key={s.label} className="px-3 text-center first:pl-0 last:pr-0">
                <dt className="sr-only">{s.label}</dt>
                <dd className="font-serif text-4xl font-medium leading-none text-gold-text md:text-5xl">{s.value}</dd>
                <dd className="mt-2 text-xs text-muted-foreground md:text-sm">{s.label}</dd>
              </div>
            ))}
          </dl>

          <Button asChild variant="outline" className="mt-8">
            <Link href="/about">
              More about Reet <ArrowRight aria-hidden />
            </Link>
          </Button>
        </Reveal>
      </div>
    </Section>
  );
}
