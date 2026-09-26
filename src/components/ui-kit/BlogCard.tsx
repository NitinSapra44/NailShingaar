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
        'group flex h-full flex-col',
        className,
      )}
    >
      <div className="relative aspect-[4/3] overflow-hidden rounded-media bg-blush">
        {post.cover_image_url ? (
          <Image
            src={post.cover_image_url}
            alt={post.title}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <span className="font-accent text-3xl italic text-foreground">Nail Shingaar</span>
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col pt-5">
        <time dateTime={new Date(post.created_at).toISOString()} className="eyebrow mb-3">
          {date}
        </time>
        <h3 className="text-xl font-medium leading-snug tracking-[-0.02em] text-foreground transition-colors group-hover:text-primary md:text-2xl">{post.title}</h3>
        {post.excerpt && <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-muted-foreground">{post.excerpt}</p>}
      </div>
    </Link>
  );
}
