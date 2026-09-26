import { cn } from '@/lib/utils';

type SectionHeadingProps = {
  eyebrow?: string;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  align?: 'center' | 'left';
  /** Right-aligned slot (e.g. a "View all" link) — shown with align="left". */
  action?: React.ReactNode;
  as?: 'h1' | 'h2';
  /** Light text for use on the ink `deep` tone. */
  onDark?: boolean;
  className?: string;
};

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = 'left',
  action,
  as: Heading = 'h2',
  onDark,
  className,
}: SectionHeadingProps) {
  const centered = align === 'center';
  const muted = onDark ? 'text-deep-foreground/70' : 'text-muted-foreground';

  return (
    <div
      className={cn(
        'mb-10 md:mb-16',
        centered ? 'mx-auto max-w-3xl text-center' : 'flex flex-col gap-6 md:flex-row md:items-end md:justify-between',
        className,
      )}
    >
      <div className={cn(!centered && 'max-w-3xl')}>
        {eyebrow && (
          <p className={cn('eyebrow mb-5 flex items-center gap-3', centered && 'justify-center', onDark && 'text-deep-foreground/70')}>
            <span aria-hidden className={cn('h-px w-8', onDark ? 'bg-deep-foreground/40' : 'bg-foreground/30')} />
            {eyebrow}
          </p>
        )}
        <Heading className={cn(Heading === 'h1' ? 'type-display' : 'type-h2', onDark ? 'text-deep-foreground' : 'text-foreground')}>
          {title}
        </Heading>
        {subtitle &&
          (typeof subtitle === 'string' ? (
            <p className={cn('mt-5 max-w-xl text-base md:text-lg', centered && 'mx-auto', muted)}>{subtitle}</p>
          ) : (
            // Rich subtitles (stars, links) may contain block elements, so no <p> wrapper.
            <div className={cn('mt-5 max-w-xl text-base md:text-lg', centered && 'mx-auto', muted)}>{subtitle}</div>
          ))}
      </div>
      {!centered && action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

/** Italic serif accent for the one expressive word in a heading. */
export function Accent({ children, className }: { children: React.ReactNode; className?: string }) {
  return <em className={cn('font-accent italic font-normal tracking-[-0.01em]', className)}>{children}</em>;
}
