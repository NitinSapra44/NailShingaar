import Image from 'next/image';
import { Section, SectionHeading, Reveal } from '@/components/ui-kit';

const GALLERY = ['/Work/W-1.jpg', '/Work/W-2.jpg', '/Work/W-3.jpg', '/Work/W-4.jpg', '/Work/W-5.jpg', '/Work/W-6.jpg'];

export default function OurWork() {
  return (
    <Section>
      <Reveal>
        <SectionHeading
          eyebrow="Handmade by Reet"
          title="Our Work"
          subtitle={
            <a
              href="https://www.instagram.com/nailshingaar"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-foreground underline decoration-gold underline-offset-4 transition-colors hover:text-primary"
            >
              @nailshingaar on Instagram
            </a>
          }
        />
      </Reveal>
      <div className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 scrollbar-none md:mx-0 md:grid md:grid-cols-6 md:gap-4 md:overflow-visible md:px-0 md:pb-0">
        {GALLERY.map((src, i) => (
          <div key={src} className="group relative aspect-square w-[42%] shrink-0 snap-start overflow-hidden rounded-media bg-blush md:w-auto">
            <Image
              src={src}
              alt={`Nail Shingaar handcrafted press-on nail design ${i + 1}`}
              fill
              sizes="(max-width: 768px) 42vw, 16vw"
              className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
            />
          </div>
        ))}
      </div>
    </Section>
  );
}
