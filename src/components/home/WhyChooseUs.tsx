import Link from 'next/link';
import { ArrowRight, Palette, Ruler, Sparkles } from 'lucide-react';
import { Section, SectionHeading, Reveal, Accent } from '@/components/ui-kit';
import { Button } from '@/components/ui/button';

const steps = [
  {
    num: '01',
    icon: Palette,
    title: 'Choose Your Design',
    desc: 'Browse 50+ styles or upload your own inspo. From bridal to everyday — there\'s a set for every version of you.',
  },
  {
    num: '02',
    icon: Ruler,
    title: 'Send Your Measurements',
    desc: 'Use our easy coin method to measure all 10 nails. Takes 2 minutes — we handle everything else.',
  },
  {
    num: '03',
    icon: Sparkles,
    title: 'Press On & Slay',
    desc: 'Your custom set arrives ready to wear. Apply in 10 minutes. Salon finish from your bedroom.',
  },
];

/** "How it works" — three steps. (The "Our Work" gallery now lives in OurWork.tsx.) */
const WhyChooseUs = () => {
  return (
    <Section>
      <Reveal>
        <SectionHeading
          eyebrow="Your Path"
          title={<>Perfect Press-Ons in <Accent>3 Steps</Accent></>}
          subtitle="Three simple steps to flawless, salon-quality nails at home."
        />
      </Reveal>

      <ol className="grid grid-cols-1 gap-10 md:grid-cols-3 md:gap-0 md:divide-x md:divide-gold/50">
        {steps.map((step, i) => (
          <li key={step.num} className="list-none md:px-10 md:first:pl-0 md:last:pr-0">
            <Reveal delay={i * 80}>
              <div className="flex items-center justify-between">
                <span className="font-serif text-6xl font-medium leading-none text-gold-text md:text-7xl" aria-hidden>
                  {step.num}
                </span>
                <step.icon className="h-6 w-6 text-gold" aria-hidden />
              </div>
              <h3 className="type-h3 mt-6 text-foreground">
                <span className="sr-only">Step {i + 1}: </span>
                {step.title}
              </h3>
              <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">{step.desc}</p>
            </Reveal>
          </li>
        ))}
      </ol>

      <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 text-center sm:flex-row sm:text-left">
        <p className="text-sm text-muted-foreground">No prior experience needed. We guide you every step of the way.</p>
        <Button asChild variant="outline">
          <Link href="/how-to-order">
            See Full Guide <ArrowRight aria-hidden />
          </Link>
        </Button>
      </div>
    </Section>
  );
};

export default WhyChooseUs;
