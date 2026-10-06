import { StorageImage } from '@/components/ui-kit/StorageImage';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
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
    <Link href={`/categories/${slug}`} className={cn('group block', className)}>
      <div className="relative aspect-[4/5] overflow-hidden rounded-media bg-blush">
        <StorageImage
          variant={1200}
          src={image}
          alt={`${name} press-on nails collection`}
          fill
          sizes={sizes}
          priority={priority}
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
        />
      </div>
      <div className="flex items-start justify-between gap-4 pt-4">
        <div className="min-w-0">
          <h3 className="text-xl font-medium tracking-[-0.02em] text-foreground md:text-2xl">{name}</h3>
          {description && <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">{description}</p>}
        </div>
        <ArrowUpRight
          className="mt-1 h-5 w-5 shrink-0 text-foreground transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary"
          aria-hidden
        />
      </div>
    </Link>
  );
}
