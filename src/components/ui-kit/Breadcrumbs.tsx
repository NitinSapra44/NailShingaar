import Link from 'next/link';
import { cn } from '@/lib/utils';

export type Crumb = { label: string; href?: string };

export function Breadcrumbs({ items, onDark, className }: { items: Crumb[]; onDark?: boolean; className?: string }) {
  return (
    <nav aria-label="Breadcrumb" className={className}>
      <ol className={cn('flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px]', onDark ? 'text-ivory/80' : 'text-muted-foreground')}>
        {items.map((c, i) => {
          const last = i === items.length - 1;
          return (
            <li key={`${c.label}-${i}`} className="flex items-center gap-2">
              {c.href && !last ? (
                <Link href={c.href} className={cn('transition-colors', onDark ? 'hover:text-ivory' : 'hover:text-foreground')}>
                  {c.label}
                </Link>
              ) : (
                <span aria-current={last ? 'page' : undefined} className={cn(last && (onDark ? 'text-ivory' : 'text-foreground'))}>
                  {c.label}
                </span>
              )}
              {!last && <span aria-hidden className={onDark ? 'text-gold-soft/70' : 'text-gold'}>/</span>}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
