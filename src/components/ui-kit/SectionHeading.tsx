import { cn } from '@/lib/utils';

type SectionHeadingProps = {
  eyebrow?: string;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  align?: 'center' | 'left';
  /** Right-aligned slot (e.g. a "View all" link) — only shown with align="left". */
  action?: React.ReactNode;
  as?: 'h1' | 'h2';
  /** Light text for use on the maroon `deep` tone. */
  onDark?: boolean;
  className?: string;
};

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = 'center',
  action,
  as: Heading = 'h2',
  onDark,
  className,
}: SectionHeadingProps) {
  const centered = align === 'center';

  return (
    <div
      className={cn(
        'mb-10 md:mb-14',
        centered ? 'text-center mx-auto max-w-2xl' : 'flex flex-col md:flex-row md:items-end md:justify-between gap-4',
        className,
      )}
    >
      <div className={cn(!centered && 'max-w-2xl')}>
        {eyebrow && <p className={cn('eyebrow mb-3', onDark && 'text-gold-soft')}>{eyebrow}</p>}
        <Heading className={cn(Heading === 'h1' ? 'type-display' : 'type-h2', onDark ? 'text-deep-foreground' : 'text-foreground')}>
          {title}
        </Heading>
        {subtitle && (
          <p className={cn('mt-4 text-base md:text-lg', onDark ? 'text-deep-foreground/80' : 'text-muted-foreground')}>
            {subtitle}
          </p>
        )}
      </div>
      {!centered && action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

/** Italic serif accent for the one highlighted word in a heading. */
export function Accent({ children, className }: { children: React.ReactNode; className?: string }) {
  return <em className={cn('font-serif italic font-medium', className)}>{children}</em>;
}
