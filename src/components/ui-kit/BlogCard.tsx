import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export type BlogCardPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  cover_image_url: string | null;
  created_at: string | Date;
};

export function BlogCard({ post, className }: { post: BlogCardPost; className?: string }) {
  const date = new Date(post.created_at).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <Link
      href={`/blog/${post.slug}`}
      className={cn(
        'group flex h-full flex-col overflow-hidden rounded-card border border-border bg-surface',
        'transition-[transform,box-shadow] duration-300 ease-out hover:-translate-y-1 hover:shadow-hover',
        className,
      )}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-blush">
        {post.cover_image_url ? (
          <Image
            src={post.cover_image_url}
            alt={post.title}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <span className="font-serif text-2xl italic text-primary">Nail Shingaar</span>
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col p-6">
        <time dateTime={new Date(post.created_at).toISOString()} className="eyebrow mb-3">
          {date}
        </time>
        <h3 className="type-h3 text-foreground transition-colors group-hover:text-primary">{post.title}</h3>
        {post.excerpt && <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-muted-foreground">{post.excerpt}</p>}
      </div>
    </Link>
  );
}
