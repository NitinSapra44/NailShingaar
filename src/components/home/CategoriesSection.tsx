'use client';

import { useEffect, useState } from 'react';
import { Section, SectionHeading, CollectionCard, Skeleton, Reveal } from '@/components/ui-kit';
import { supabase } from '@/integrations/supabase/client';
import { Category } from '@/types';

// Fallback nail images mapped by category slug
const CATEGORY_IMAGES: Record<string, string> = {
  'basics-everyday':
    'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=600&h=450&fit=crop',
  'western-wear':
    'https://images.unsplash.com/photo-1604655333-a4f000e8d9c0?w=600&h=450&fit=crop',
  'indian-bridal-festive':
    'https://images.unsplash.com/photo-1519014816548-bf5fe059798b?w=600&h=450&fit=crop',
  'summer-edition':
    'https://images.unsplash.com/photo-1604655333-a4f000e8d9c0?w=600&h=450&fit=crop',
  'winter-edition':
    'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=600&h=450&fit=crop',
  'holiday-nails':
    'https://images.unsplash.com/photo-1519014816548-bf5fe059798b?w=600&h=450&fit=crop',
  custom:
    'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=600&h=450&fit=crop',
};

const DEFAULT_IMAGE =
  'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=600&h=450&fit=crop';

const CategoriesSection = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data, error } = await supabase.from('categories').select('*').limit(7);
        if (error) throw error;
        setCategories(data || []);
      } catch {
        // silently ignore
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  const getCategoryImage = (category: Category) =>
    category.image_url || CATEGORY_IMAGES[category.slug] || DEFAULT_IMAGE;

  const track =
    '-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 scrollbar-none sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-6 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-3';
  const item = 'w-[78%] shrink-0 snap-start sm:w-auto';

  if (loading) {
    return (
      <Section tone="soft" aria-busy="true">
        <SectionHeading eyebrow="Explore" title="Shop by Collection" subtitle="From everyday elegance to bridal splendour." />
        <div className={track}>
          {[1, 2, 3].map((n) => (
            <Skeleton key={n} className={`${item} aspect-[4/5] rounded-card`} />
          ))}
        </div>
      </Section>
    );
  }

  if (categories.length === 0) return null;

  return (
    <Section tone="soft">
      <Reveal>
        <SectionHeading eyebrow="Explore" title="Shop by Collection" subtitle="From everyday elegance to bridal splendour." />
      </Reveal>
      <div className={track}>
        {categories.map((c, index) => (
          <Reveal key={c.slug} delay={index * 60} className={item}>
            <CollectionCard name={c.name} slug={c.slug} description={c.description} image={getCategoryImage(c)} />
          </Reveal>
        ))}
      </div>
    </Section>
  );
};

export default CategoriesSection;
