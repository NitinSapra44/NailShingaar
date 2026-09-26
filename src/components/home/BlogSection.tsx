'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Section, SectionHeading, BlogCard, Reveal } from '@/components/ui-kit';

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
    fetch('/api/blog?published=true&limit=3')
      .then((res) => res.json())
      .then((data: Post[]) => {
        setPosts(data || []);
        setLoading(false);
      });
  }, []);

  if (loading || posts.length === 0) return null;

  return (
    <Section tone="soft">
      <Reveal>
        <SectionHeading
          align="left"
          eyebrow="Journal"
          title="Nail Notes"
          action={
            <Button asChild variant="link" className="group">
              <Link href="/blog">
                View all <ArrowRight className="transition-transform group-hover:translate-x-1" aria-hidden />
              </Link>
            </Button>
          }
        />
      </Reveal>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
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
