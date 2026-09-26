import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

type CollectionCardProps = {
  name: string;
  slug: string;
  description?: string | null;
  image: string;
  sizes?: string;
  priority?: boolean;
  className?: string;
};

export function CollectionCard({
  name,
  slug,
  description,
  image,
  sizes = '(max-width: 640px) 80vw, (max-width: 1024px) 50vw, 33vw',
  priority,
  className,
}: CollectionCardProps) {
  return (
    <Link
      href={`/categories/${slug}`}
      className={cn(
        'group relative block aspect-[4/5] overflow-hidden rounded-card bg-blush',
        'transition-[transform,box-shadow] duration-300 ease-out hover:-translate-y-1 hover:shadow-hover',
        className,
      )}
    >
      <Image
        src={image}
        alt={`${name} press-on nails collection`}
        fill
        sizes={sizes}
        priority={priority}
        className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/25 to-transparent" aria-hidden />
      <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-4 md:p-6">
        <div className="min-w-0">
          <h3 className="font-serif text-xl font-semibold leading-tight text-ivory md:text-2xl">{name}</h3>
          {description && <p className="mt-1 line-clamp-1 text-sm text-ivory/80">{description}</p>}
        </div>
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-ivory/50 md:h-10 md:w-10 text-ivory transition-colors duration-300 group-hover:bg-ivory group-hover:text-foreground">
          <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" aria-hidden />
        </span>
      </div>
    </Link>
  );
}
