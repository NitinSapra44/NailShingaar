'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import Layout from '@/components/layout/Layout';
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
      <div className="min-h-screen bg-background">
        <div className="bg-gradient-card py-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="font-display text-4xl md:text-5xl font-semibold">
              Our <span className="text-gradient">Collections</span>
            </h1>
            <p className="mt-2 text-muted-foreground">Find your perfect style from our curated categories</p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => <div key={i} className="animate-pulse"><div className="aspect-[4/3] rounded-2xl bg-muted" /></div>)}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {categories.map((category, index) => (
                <Link key={category.id} href={`/categories/${category.slug}`}
                  className="group relative aspect-[4/3] rounded-2xl overflow-hidden shadow-soft hover:shadow-card transition-all duration-300 animate-fade-up"
                  style={{ animationDelay: `${index * 100}ms` } as React.CSSProperties}>
                  <img src={category.image_url || 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=600'}
                    alt={category.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-foreground/20 to-transparent" />
                  <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between">
                    <div>
                      <h2 className="font-display text-2xl font-semibold text-background">{category.name}</h2>
                      {category.description && (
                        <p className="text-sm text-background/80 mt-1 max-w-[200px]">{category.description}</p>
                      )}
                    </div>
                    <div className="p-3 rounded-full bg-background/20 backdrop-blur group-hover:bg-background/40 transition-colors">
                      <ArrowRight className="h-5 w-5 text-background group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
