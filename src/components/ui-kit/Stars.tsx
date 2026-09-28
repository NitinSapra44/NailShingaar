import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

// `value` supports fractions (e.g. 4.8): the last star is partially filled.
export function Stars({ count = 5, value, className, label }: { count?: number; value?: number; className?: string; label?: string }) {
  const rating = value ?? count;
  return (
    <span className={cn("inline-flex items-center gap-0.5", className)} role="img" aria-label={label ?? `${rating} out of 5 stars`}>
      {Array.from({ length: count }).map((_, i) => {
        const fill = Math.max(0, Math.min(1, rating - i));
        return (
          <span key={i} className="relative inline-block h-3.5 w-3.5" aria-hidden>
            <Star className="absolute inset-0 h-3.5 w-3.5 text-star" />
            {fill > 0 && (
              <span className="absolute inset-y-0 left-0 overflow-hidden" style={{ width: `${fill * 100}%` }}>
                <Star className="h-3.5 w-3.5 fill-star text-star" />
              </span>
            )}
          </span>
        );
      })}
    </span>
  );
}
