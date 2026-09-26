import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { and, eq } from 'drizzle-orm';
import { db } from '@/lib/db/client';
import { blogPosts } from '@/lib/db/schema';
import Layout from '@/components/layout/Layout';
import type { Metadata } from 'next';

// Queries Postgres directly (server component) — render per-request rather
// than at build time, since build environments won't always have DATABASE_URL
// access and blog content changes without a redeploy.
export const dynamic = 'force-dynamic';

async function getPublishedPost(slug: string) {
  const [row] = await db
    .select()
    .from(blogPosts)
    .where(and(eq(blogPosts.slug, slug), eq(blogPosts.published, true)))
    .limit(1);
  return row ?? null;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const data = await getPublishedPost(slug);

  if (!data) return { title: 'Post Not Found | Nail Shingaar' };

  return {
    title: `${data.title} | Nail Shingaar by Reet`,
    description: data.metaDescription || data.title,
    openGraph: {
      title: data.title,
      description: data.metaDescription || '',
      images: data.coverImageUrl ? [{ url: data.coverImageUrl }] : [],
    },
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPublishedPost(slug);

  if (!post) notFound();

  const paragraphs = (post.content || '').split(/\n\n+/).filter(Boolean);

  return (
    <Layout>
      <article className="container pb-20 pt-10 md:pb-28 md:pt-14">
        <div className="mx-auto max-w-reading">
          <Link href="/blog" className="group mb-10 inline-flex items-center gap-1.5 text-sm font-semibold text-foreground transition-colors hover:text-primary">
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" aria-hidden /> Back to Blog
          </Link>

          <time dateTime={post.createdAt.toISOString()} className="eyebrow mb-4 block">
            {post.createdAt.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
          </time>
          <h1 className="font-serif text-[38px] font-medium leading-[1.1] text-foreground md:text-[52px]">{post.title}</h1>

          {post.excerpt && (
            <p className="mt-6 border-l-2 border-gold pl-5 font-serif text-xl italic leading-relaxed text-muted-foreground md:text-2xl">
              {post.excerpt}
            </p>
          )}
        </div>

        {post.coverImageUrl && (
          <div className="mx-auto my-10 max-w-4xl overflow-hidden rounded-card md:my-14">
            <img src={post.coverImageUrl} alt={post.title} className="aspect-[3/2] w-full object-cover" />
          </div>
        )}

        <div className="mx-auto max-w-reading space-y-6 text-[17px] leading-[1.75] text-foreground/85">
          {paragraphs.map((para: string, i: number) => (
            <p key={i}>{para}</p>
          ))}
        </div>

        <div className="mx-auto mt-16 max-w-reading rounded-card border border-gold/40 bg-blush px-6 py-10 text-center">
          <p className="font-serif text-2xl text-foreground">Want nails like this?</p>
          <Link
            href="/custom-order"
            className="mt-5 inline-flex h-12 items-center gap-2 rounded-full bg-primary px-7 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover"
          >
            Order Custom Nails
          </Link>
        </div>
      </article>
    </Layout>
  );
}
