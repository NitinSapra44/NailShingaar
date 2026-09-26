import { createClient } from '@supabase/supabase-js';
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

async function getPosts() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const { data } = await supabase
    .from('blog_posts')
    .select('id, title, slug, excerpt, cover_image_url, created_at')
    .eq('published', true)
    .order('created_at', { ascending: false });
  return data || [];
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
