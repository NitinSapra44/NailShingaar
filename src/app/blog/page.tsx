import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import Layout from '@/components/layout/Layout';
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
      <div className="container mx-auto px-4 py-16 max-w-5xl">
        <div className="text-center mb-12">
          <p className="text-xs font-semibold tracking-[0.25em] text-muted-foreground uppercase mb-2">Tips & Trends</p>
          <h1 className="font-display text-4xl md:text-6xl">
            The Nail <span className="text-gradient">Blog</span>
          </h1>
          <p className="mt-3 text-muted-foreground">
            Tutorials, trends & everything you need to know about press-on nails
          </p>
        </div>

        {posts.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <p className="text-lg">No posts yet — check back soon!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post: any, i: number) => (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="group rounded-2xl overflow-hidden shadow-soft hover:shadow-card transition-all duration-300 bg-card border border-border"
              >
                {post.cover_image_url ? (
                  <div className="aspect-[3/2] overflow-hidden">
                    <img
                      src={post.cover_image_url}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                ) : (
                  <div className="aspect-[3/2] bg-pink-light flex items-center justify-center">
                    <span className="text-primary font-script text-2xl">Nail Shingaar</span>
                  </div>
                )}
                <div className="p-5">
                  <p className="text-[10px] text-muted-foreground tracking-[0.2em] uppercase mb-2">
                    {new Date(post.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                  <h2 className="font-display text-lg font-semibold text-foreground group-hover:text-primary transition-colors leading-tight mb-2">
                    {post.title}
                  </h2>
                  {post.excerpt && (
                    <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">{post.excerpt}</p>
                  )}
                  <div className="flex items-center gap-1 mt-3 text-primary text-sm font-semibold">
                    Read more <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
