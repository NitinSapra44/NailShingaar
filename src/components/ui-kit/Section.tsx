import { cn } from '@/lib/utils';
import { Container } from './Container';

export type SectionTone = 'default' | 'soft' | 'deep';

const toneClass: Record<SectionTone, string> = {
  default: 'bg-background text-foreground',
  soft: 'bg-blush text-foreground',
  deep: 'bg-deep text-deep-foreground',
};

type SectionProps = React.HTMLAttributes<HTMLElement> & {
  tone?: SectionTone;
  /** Skip the inner Container (for full-bleed content). */
  bleed?: boolean;
  containerClassName?: string;
};

export function Section({ tone = 'default', bleed, className, containerClassName, children, ...props }: SectionProps) {
  return (
    <section data-tone={tone} className={cn("section-y", toneClass[tone], className)} {...props}>
      {bleed ? children : <Container className={containerClassName}>{children}</Container>}
    </section>
  );
}
