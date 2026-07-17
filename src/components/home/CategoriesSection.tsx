'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
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

  if (loading) {
    return (
      <section className="py-20 bg-card">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="animate-pulse aspect-[4/3] rounded-2xl bg-muted" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (categories.length === 0) return null;

  const displayCategories = categories.map((c) => ({
    name: c.name,
    slug: c.slug,
    description: c.description ?? '',
    image: getCategoryImage(c),
  }));

  return (
    <section className="py-20 bg-card">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <span className="font-script text-2xl text-primary">explore</span>
          <h2 className="font-display text-3xl md:text-4xl font-semibold mt-1">
            Shop by <span className="text-gradient">Collection</span>
          </h2>
          <p className="mt-2 text-muted-foreground">
            From everyday elegance to bridal splendour — find your perfect set
          </p>
        </div>

        {/* Bento-style grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {displayCategories.map((cat, index) => {
            const isFeatured = index === 0 || index === 3;
            return (
              <Link
                key={cat.slug}
                href={`/categories/${cat.slug}`}
                className={`group relative overflow-hidden rounded-2xl shadow-soft hover:shadow-card transition-all duration-300 animate-fade-up ${
                  isFeatured ? 'md:row-span-1 aspect-[4/3]' : 'aspect-[4/3]'
                }`}
                style={{ animationDelay: `${index * 80}ms` }}
              >
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-foreground/20 to-transparent" />

                {/* Content */}
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h3 className="font-display text-base md:text-lg font-semibold text-white leading-tight">
                    {cat.name}
                  </h3>
                  {cat.description && (
                    <p className="text-xs text-white/75 mt-0.5 line-clamp-1">{cat.description}</p>
                  )}
                </div>

                {/* Arrow */}
                <div className="absolute top-3 right-3 h-8 w-8 rounded-full bg-white/20 backdrop-blur flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <ArrowRight className="h-4 w-4 text-white group-hover:translate-x-0.5 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default CategoriesSection;
