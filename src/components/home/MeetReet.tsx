import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Section, Reveal, Accent } from '@/components/ui-kit';
import { Button } from '@/components/ui/button';

// Stats are facts already published on the site (About page + Google reviews section).
const STATS = [
  { value: '7+', label: 'Years of experience' },
  { value: '1000+', label: 'Happy clients' },
  { value: '5.0', label: 'Google rating' },
];

export default function MeetReet() {
  return (
    <Section>
      <div className="grid items-center gap-10 md:grid-cols-12 md:gap-12 lg:gap-20">
        <Reveal className="md:col-span-5">
          <div className="relative aspect-[4/5] overflow-hidden rounded-media bg-blush">
            <Image
              src="/reet-photo.jpg"
              alt="Reet Rajpal, nail artist and founder of Nail Shingaar, holding a Nail Shingaar gift bag"
              fill
              sizes="(max-width: 768px) 90vw, 40vw"
              className="object-cover object-[50%_30%]"
            />
          </div>
        </Reveal>

        <Reveal delay={80} className="md:col-span-7">
          <p className="eyebrow mb-5 flex items-center gap-3">
            <span aria-hidden className="h-px w-8 bg-foreground/30" />
            The artist
          </p>
          <h2 className="type-h2 text-foreground">
            Meet <Accent>Reet</Accent>
          </h2>
          {/* TODO(copy): adapted to third person from the About page "My Story" — confirm wording with Reet */}
          <p className="mt-6 max-w-2xl text-xl font-medium leading-snug tracking-[-0.02em] text-foreground md:text-2xl">
            With more than 7 years of experience, Reet has established herself as a well-known and respected nail
            technician and educator.
          </p>
          <p className="mt-4 max-w-xl text-muted-foreground">
            Every press-on set is handmade for every mood &amp; occasion — from soft everyday looks to bold glam
            designs — made with love, detail, and a little bit of shingaar.
          </p>

          <dl className="mt-10 grid max-w-xl grid-cols-3 gap-6 border-t border-border pt-6">
            {STATS.map((s) => (
              <div key={s.label}>
                <dt className="sr-only">{s.label}</dt>
                <dd className="text-4xl font-medium leading-none tracking-[-0.04em] text-foreground md:text-5xl">{s.value}</dd>
                <dd className="mt-2 text-xs text-muted-foreground md:text-sm">{s.label}</dd>
              </div>
            ))}
          </dl>

          <Button asChild variant="outline" className="mt-10">
            <Link href="/about">
              More about Reet <ArrowRight aria-hidden />
            </Link>
          </Button>
        </Reveal>
      </div>
    </Section>
  );
}
