import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Stars({ count = 5, className, label }: { count?: number; className?: string; label?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-0.5", className)} role="img" aria-label={label ?? `${count} out of 5 stars`}>
      {Array.from({ length: count }).map((_, i) => (
        <Star key={i} className="h-3.5 w-3.5 fill-star text-star" aria-hidden />
      ))}
    </span>
  );
}
