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

/** "How it works" — three steps, set on the page's one ink band. */
const WhyChooseUs = () => {
  return (
    <Section tone="deep">
      <Reveal>
        <SectionHeading
          onDark
          eyebrow="How it works"
          title={<>Perfect press-ons in <Accent>three steps</Accent></>}
          subtitle="Three simple steps to flawless, salon-quality nails at home."
          action={
            <Button asChild variant="outline" className="border-deep-foreground/60 text-deep-foreground hover:bg-deep-foreground hover:text-deep">
              <Link href="/how-to-order">
                See Full Guide <ArrowRight aria-hidden />
              </Link>
            </Button>
          }
        />
      </Reveal>

      <ol className="grid grid-cols-1 gap-12 md:grid-cols-3 md:gap-10">
        {steps.map((step, i) => (
          <li key={step.num} className="list-none border-t border-deep-foreground/20 pt-6">
            <Reveal delay={i * 80}>
              <div className="flex items-start justify-between">
                <span className="font-accent text-7xl italic leading-none text-deep-foreground md:text-8xl" aria-hidden>
                  {step.num}
                </span>
                <step.icon className="mt-2 h-5 w-5 text-deep-foreground/60" aria-hidden />
              </div>
              <h3 className="mt-8 text-2xl font-medium tracking-[-0.02em] text-deep-foreground">
                <span className="sr-only">Step {i + 1}: </span>
                {step.title}
              </h3>
              <p className="mt-3 text-[15px] leading-relaxed text-deep-foreground/70">{step.desc}</p>
            </Reveal>
          </li>
        ))}
      </ol>

      <p className="mt-14 text-sm text-deep-foreground/60">No prior experience needed. We guide you every step of the way.</p>
    </Section>
  );
};

export default WhyChooseUs;
