'use client';

import { useEffect, useState } from 'react';
import Layout from '@/components/layout/Layout';
import { Section, PageHeader, CollectionCard, Skeleton, Reveal } from '@/components/ui-kit';
import { supabase } from '@/integrations/supabase/client';
import { Category } from '@/types';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from('categories').select('*').order('name')
      .then(({ data }) => { setCategories(data || []); setLoading(false); });
  }, []);

  return (
    <Layout>
      <PageHeader
        eyebrow="Collections"
        title="Our Collections"
        subtitle="Find your perfect style from our curated categories"
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Collections' }]}
      />

      <Section>
        {loading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="aspect-[4/5] rounded-card" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((category, index) => (
              <Reveal key={category.id} delay={(index % 3) * 60}>
                <CollectionCard
                  name={category.name}
                  slug={category.slug}
                  description={category.description}
                  image={category.image_url || 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=600'}
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  priority={index === 0}
                />
              </Reveal>
            ))}
          </div>
        )}
      </Section>
    </Layout>
  );
}
