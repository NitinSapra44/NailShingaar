import { desc, eq } from 'drizzle-orm';
import { db } from '@/lib/db/client';
import { blogPosts } from '@/lib/db/schema';
import Layout from '@/components/layout/Layout';
// Direct imports (not the ui-kit barrel): this is a server component.
import { PageHeader } from '@/components/ui-kit/PageHeader';
import { Section } from '@/components/ui-kit/Section';
import { BlogCard } from '@/components/ui-kit/BlogCard';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Blog — Nail Tips, Trends & Tutorials | Nail Shingaar by Reet',
  description: 'Read our latest nail care tips, press-on nail tutorials, and bridal nail trends from Nail Shingaar by Reet.',
};

// Queries Postgres directly (server component) — render per-request rather
// than at build time, since build environments won't always have DATABASE_URL
// access and blog content changes without a redeploy.
export const dynamic = 'force-dynamic';

async function getPosts() {
  return db
    .select({
      id: blogPosts.id,
      title: blogPosts.title,
      slug: blogPosts.slug,
      excerpt: blogPosts.excerpt,
      cover_image_url: blogPosts.coverImageUrl,
      created_at: blogPosts.createdAt,
    })
    .from(blogPosts)
    .where(eq(blogPosts.published, true))
    .orderBy(desc(blogPosts.createdAt));
}

export default async function BlogPage() {
  const posts = await getPosts();

  return (
    <Layout>
      <PageHeader
        eyebrow="Tips & Trends"
        title={<>The Nail <em className="font-serif italic">Blog</em></>}
        subtitle="Tutorials, trends & everything you need to know about press-on nails"
      />

      <Section>
        {posts.length === 0 ? (
          <p className="py-12 text-center text-lg text-muted-foreground">No posts yet — check back soon!</p>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <BlogCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </Section>
    </Layout>
  );
}
