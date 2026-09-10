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
      <article className="container mx-auto px-4 py-12 max-w-2xl">
        {/* Back */}
        <Link href="/blog" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors mb-8">
          <ArrowLeft className="h-4 w-4" /> Back to Blog
        </Link>

        {/* Cover image */}
        {post.coverImageUrl && (
          <div className="aspect-[3/2] rounded-2xl overflow-hidden mb-8 shadow-soft">
            <img src={post.coverImageUrl} alt={post.title} className="w-full h-full object-cover" />
          </div>
        )}

        {/* Meta */}
        <p className="text-xs text-muted-foreground tracking-[0.2em] uppercase mb-3">
          {post.createdAt.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
        </p>

        {/* Title */}
        <h1 className="font-display text-3xl md:text-4xl font-semibold leading-tight mb-6">{post.title}</h1>

        {/* Excerpt */}
        {post.excerpt && (
          <p className="text-lg text-muted-foreground leading-relaxed border-l-4 border-primary pl-4 mb-8 italic">
            {post.excerpt}
          </p>
        )}

        {/* Content */}
        <div className="prose prose-sm max-w-none space-y-5">
          {paragraphs.map((para: string, i: number) => (
            <p key={i} className="text-foreground/85 leading-relaxed text-base">{para}</p>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-border text-center">
          <p className="text-sm text-muted-foreground mb-3">Want nails like this?</p>
          <Link
            href="/custom-order"
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-full font-semibold text-sm hover:bg-pink-dark transition-colors shadow-soft"
          >
            Order Custom Nails
          </Link>
        </div>
      </article>
    </Layout>
  );
}
