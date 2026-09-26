'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Section, SectionHeading, BlogCard, Reveal, Accent } from '@/components/ui-kit';
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
    <Section tone="soft">
      <Reveal>
        <SectionHeading
          eyebrow="Journal"
          title={<>Nail <Accent>notes</Accent></>}
          action={
            <Button asChild variant="link" className="group">
              <Link href="/blog">
                View all <ArrowRight className="transition-transform group-hover:translate-x-1" aria-hidden />
              </Link>
            </Button>
          }
        />
      </Reveal>
      <div className="grid grid-cols-1 gap-x-6 gap-y-12 md:grid-cols-3">
        {posts.map((post, i) => (
          <Reveal key={post.id} delay={i * 80} className="h-full">
            <BlogCard post={post} />
          </Reveal>
        ))}
      </div>
    </Section>
  );
};

export default BlogSection;
