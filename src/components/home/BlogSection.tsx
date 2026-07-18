'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  cover_image_url: string | null;
  created_at: string;
}

const BlogSection = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase as any)
      .from('blog_posts')
      .select('id, title, slug, excerpt, cover_image_url, created_at')
      .eq('published', true)
      .order('created_at', { ascending: false })
      .limit(3)
      .then(({ data }: { data: Post[] | null }) => {
        setPosts(data || []);
        setLoading(false);
      });
  }, []);

  if (loading || posts.length === 0) return null;

  return (
    <section className="py-20 bg-card">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-12">
          <div>
            <p className="text-xs font-semibold tracking-[0.25em] text-muted-foreground uppercase mb-2">Tips & Trends</p>
            <h2 className="font-display text-4xl md:text-6xl">
              The Latest in <span className="text-gradient">Nail Trends</span>
            </h2>
          </div>
          <Link
            href="/blog"
            className="flex items-center gap-1.5 text-sm text-primary font-semibold hover:underline group shrink-0"
          >
            View All
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {posts.map((post, i) => (
            <Link
              key={post.id}
              href={`/blog/${post.slug}`}
              className="group rounded-2xl overflow-hidden shadow-soft hover:shadow-card transition-all duration-300 bg-background animate-fade-up"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="aspect-[3/2] overflow-hidden">
                {post.cover_image_url ? (
                  <img
                    src={post.cover_image_url}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full bg-pink-light flex items-center justify-center">
                    <span className="text-primary font-script text-xl">Nail Shingaar</span>
                  </div>
                )}
              </div>
              <div className="p-5">
                <p className="text-[10px] text-muted-foreground tracking-[0.2em] uppercase mb-2">
                  {new Date(post.created_at).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                </p>
                <h3 className="font-display text-lg font-semibold text-foreground group-hover:text-primary transition-colors leading-tight mb-2">
                  {post.title}
                </h3>
                {post.excerpt && (
                  <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">{post.excerpt}</p>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BlogSection;
