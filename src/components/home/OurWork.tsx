import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { Section, SectionHeading, Reveal, Accent } from '@/components/ui-kit';
import { cn } from '@/lib/utils';

// Real product photos; each tile links to the product it shows.
// Desktop is a 4×3 bento: one 2×2 feature, two tall portraits, then a row of three + the Instagram tile.
const GALLERY = [
  { name: 'Soft Muse', slug: 'soft-muse', src: '/editorial/work-soft-muse.jpg', tile: 'col-span-2 aspect-[4/3] md:row-span-2 md:aspect-auto', sizes: '(max-width: 768px) 100vw, 50vw' },
  { name: 'Royal Jewel', slug: 'royal-jewel', src: '/editorial/work-royal-jewel.jpg', tile: 'aspect-[4/5] md:row-span-2 md:aspect-auto', sizes: '(max-width: 768px) 50vw, 25vw' },
  { name: 'Crimson Rose', slug: 'crimson-rose', src: '/editorial/work-crimson-rose.jpg', tile: 'aspect-[4/5] md:row-span-2 md:aspect-auto', sizes: '(max-width: 768px) 50vw, 25vw' },
  { name: 'Golden Grace', slug: 'golden-grace', src: '/editorial/work-golden-grace.jpg', tile: 'aspect-square md:aspect-auto', sizes: '(max-width: 768px) 50vw, 25vw' },
  { name: 'Dotty Berry', slug: 'dotty-berry', src: '/editorial/work-dotty-berry.jpg', tile: 'aspect-square md:aspect-auto', sizes: '(max-width: 768px) 50vw, 25vw' },
  { name: 'Princess Bow', slug: 'princess-bow', src: '/editorial/work-princess-bow.jpg', tile: 'aspect-square md:aspect-auto', sizes: '(max-width: 768px) 50vw, 25vw' },
];

export default function OurWork() {
  return (
    <Section>
      <Reveal>
        <SectionHeading
          eyebrow="Handmade by Reet"
          title={<>Our <Accent>work</Accent></>}
          // TODO(copy): new subtitle — confirm wording
          subtitle="Every set is hand-painted to order. A few recent favourites from the studio."
        />
      </Reveal>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:grid-rows-[repeat(3,minmax(0,220px))] md:gap-4 lg:grid-rows-[repeat(3,minmax(0,260px))]">
        {GALLERY.map((g, i) => (
          <Reveal key={g.slug} delay={(i % 4) * 60} className={cn('relative', g.tile)}>
            <Link
              href={`/product/${g.slug}`}
              className="group absolute inset-0 overflow-hidden rounded-media bg-blush"
            >
              <Image
                src={g.src}
                alt={`${g.name} press-on nails by Nail Shingaar`}
                fill
                sizes={g.sizes}
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
              />
              <span
                aria-hidden
                className="absolute inset-0 bg-gradient-to-t from-ink/55 via-transparent to-transparent opacity-100 transition-opacity duration-300 can-hover:opacity-0 can-hover:group-hover:opacity-100"
              />
              <span className="absolute inset-x-3 bottom-3 flex items-center justify-between gap-2 text-sm font-medium text-white transition-all duration-300 can-hover:translate-y-2 can-hover:opacity-0 can-hover:group-hover:translate-y-0 can-hover:group-hover:opacity-100 md:inset-x-4 md:bottom-4">
                {g.name}
                <ArrowUpRight className="h-4 w-4 shrink-0" aria-hidden />
              </span>
            </Link>
          </Reveal>
        ))}

        {/* Instagram tile closes the grid */}
        <Reveal delay={180} className="relative col-span-2 aspect-[2/1] md:col-span-1 md:aspect-auto">
          <a
            href="https://www.instagram.com/nailshingaar"
            target="_blank"
            rel="noopener noreferrer"
            className="group absolute inset-0 flex flex-col justify-between rounded-media bg-foreground p-5 text-background transition-colors hover:bg-primary md:p-6"
          >
            <span className="eyebrow text-background/70">Instagram</span>
            <span>
              <span className="block font-accent text-3xl italic leading-none md:text-4xl">@nailshingaar</span>
              <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold">
                See more of our work
                <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden />
              </span>
            </span>
          </a>
        </Reveal>
      </div>
    </Section>
  );
}
