import Image from 'next/image';
import { ArrowUpRight } from 'lucide-react';
import { Section, SectionHeading, Container, Reveal, Accent } from '@/components/ui-kit';

const GALLERY = [
  { src: '/editorial/work-soft-muse.jpg', name: 'Soft Muse' },
  { src: '/editorial/work-royal-jewel.jpg', name: 'Royal Jewel' },
  { src: '/editorial/work-princess-bow.jpg', name: 'Princess Bow' },
  { src: '/editorial/work-golden-grace.jpg', name: 'Golden Grace' },
  { src: '/editorial/work-dotty-berry.jpg', name: 'Dotty Berry' },
  { src: '/editorial/work-crimson-rose.jpg', name: 'Crimson Rose' },
];

export default function OurWork() {
  return (
    <Section bleed>
      <Container>
        <Reveal>
          <SectionHeading
            eyebrow="Handmade by Reet"
            title={<>Our <Accent>work</Accent></>}
            action={
              <a
                href="https://www.instagram.com/nailshingaar"
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-1.5 text-sm font-semibold text-foreground transition-colors hover:text-primary"
              >
                @nailshingaar on Instagram
                <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden />
              </a>
            }
          />
        </Reveal>
      </Container>
      {/* Edge-to-edge strip */}
      <div className="grid grid-cols-3 gap-1 md:grid-cols-6">
        {GALLERY.map(({ src, name }) => (
          <div key={src} className="group relative aspect-square overflow-hidden bg-blush">
            <Image
              src={src}
              alt={`${name} press-on nails by Nail Shingaar`}
              fill
              sizes="(max-width: 768px) 33vw, 17vw"
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]"
            />
          </div>
        ))}
      </div>
    </Section>
  );
}
