'use client';

import { useCallback, useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from '@/components/ui/carousel';
import { Section, SectionHeading, ReviewCard, Stars, GoogleG, Reveal, Accent, type Review } from '@/components/ui-kit';
import { cn } from '@/lib/utils';

const reviews: Review[] = [
  {
    name: 'Arushi Puri',
    initials: 'AP',
    badge: 'Local Guide',
    time: '3 years ago',
    text: "She's one of the oldest nail techs in the city. Her work is super neat and aesthetic. She's a fabulous teacher too. Do visit her to get the best service that too at reasonable prices.",
  },
  {
    name: 'Jeenia Jain',
    initials: 'JJ',
    badge: 'Local Guide',
    time: '3 years ago',
    text: 'Absolutely beautiful nail work by Reet! She made sure I was happy with my nails. My first and not last visit to Nail Shingaar. I would recommend her for her expertise and high-quality service!',
  },
  {
    name: 'Gunn Malhotra',
    initials: 'GM',
    badge: null,
    time: '2 years ago',
    text: 'Nail shingaar is the best place for nails in the city. The best, comfy, cozy space where you can get any nail art you want. You wish and Reet will do it for you! You just blindly come to her place and trust me — you won\'t be disappointed.',
  },
  {
    name: 'Sachin Gambhir',
    initials: 'SG',
    badge: 'Local Guide',
    time: '11 months ago',
    text: 'Great nail artist and teacher. Highly recommend for anyone looking for beautiful custom nails done with care and precision.',
  },
  {
    name: 'Simran Kaur',
    initials: 'SK',
    badge: null,
    time: '10 months ago',
    text: 'Best in the town 🥰',
  },
  {
    name: 'MANAV LATH',
    initials: 'ML',
    badge: null,
    time: '3 years ago',
    text: "She's best in the business 👌",
  },
  {
    name: 'NITIKA Popley',
    initials: 'NP',
    badge: 'Local Guide',
    time: '3 years ago',
    text: 'She is best teacher and my bestfriend too ❤️',
  },
  {
    name: 'Aradhika Kaplish',
    initials: 'AK',
    badge: null,
    time: '3 years ago',
    text: 'Best in the hood! ❤️',
  },
];

const ARROW =
  'flex h-11 w-11 items-center justify-center rounded-full border border-foreground/80 text-foreground transition-colors hover:bg-foreground hover:text-background disabled:pointer-events-none disabled:opacity-30';

export default function GoogleReviews() {
  const [api, setApi] = useState<CarouselApi>();
  const [selected, setSelected] = useState(0);
  const [snaps, setSnaps] = useState<number[]>([]);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  const sync = useCallback((a: CarouselApi) => {
    if (!a) return;
    setSelected(a.selectedScrollSnap());
    setSnaps(a.scrollSnapList());
    setCanPrev(a.canScrollPrev());
    setCanNext(a.canScrollNext());
  }, []);

  useEffect(() => {
    if (!api) return;
    sync(api);
    api.on('select', sync);
    api.on('reInit', sync);
    return () => {
      api.off('select', sync);
      api.off('reInit', sync);
    };
  }, [api, sync]);

  return (
    <Section>
      <Reveal>
        <SectionHeading
          eyebrow="What clients say"
          title={<>Real <Accent>reviews</Accent></>}
          subtitle={
            <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <Stars value={4.8} label="Rated 4.8 out of 5" />
              <span className="font-semibold text-foreground">4.8 on Google</span>
              <GoogleG />
              {/* TODO(copy): add the total Google review count once confirmed */}
            </span>
          }
          action={
            <div className="hidden gap-3 md:flex">
              <button type="button" className={ARROW} onClick={() => api?.scrollPrev()} disabled={!canPrev} aria-label="Previous reviews">
                <ArrowLeft className="h-4 w-4" aria-hidden />
              </button>
              <button type="button" className={ARROW} onClick={() => api?.scrollNext()} disabled={!canNext} aria-label="Next reviews">
                <ArrowRight className="h-4 w-4" aria-hidden />
              </button>
            </div>
          }
        />
      </Reveal>

      <Carousel setApi={setApi} opts={{ align: 'start' }} aria-label="Client reviews">
        <CarouselContent className="-ml-4 md:-ml-10">
          {reviews.map((r) => (
            <CarouselItem key={r.name} className="basis-[83%] pl-4 sm:basis-1/2 md:pl-10 lg:basis-1/3">
              <ReviewCard review={r} />
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>

      <div className="mt-8 flex items-center justify-center">
        {snaps.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => api?.scrollTo(i)}
            aria-label={`Go to review ${i + 1}`}
            aria-current={i === selected}
            className="group flex h-6 items-center px-1"
          >
            <span
              className={cn(
                'block h-1.5 rounded-full transition-all duration-300',
                i === selected ? 'w-6 bg-primary' : 'w-1.5 bg-foreground/25 group-hover:bg-foreground/50',
              )}
            />
          </button>
        ))}
      </div>

      {/* TODO(link): add a "Read all reviews on Google" link — no Google Business profile URL exists in the codebase yet */}
    </Section>
  );
}
