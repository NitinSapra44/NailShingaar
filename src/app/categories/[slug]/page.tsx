'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Layout from '@/components/layout/Layout';
import ProductCard from '@/components/products/ProductCard';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Product, Category } from '@/types';

export default function CategoryDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!slug) return;
      try {
        const { data: categoryData } = await supabase.from('categories').select('*').eq('slug', slug).maybeSingle();
        setCategory(categoryData);
        if (categoryData) {
          const { data: junctionRows } = await (supabase as any)
            .from('product_categories').select('product_id').eq('category_id', categoryData.id);
          const productIds = ((junctionRows ?? []) as { product_id: string }[]).map((r) => r.product_id);
          if (productIds.length > 0) {
            const { data: productsData } = await supabase
              .from('products').select('*').in('id', productIds).order('created_at', { ascending: false });
            setProducts(productsData || []);
          }
        }
      } catch (error) {
        console.error('Error fetching category:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [slug]);

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12 animate-pulse">
          <div className="h-8 w-48 bg-muted rounded mb-8" />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => <div key={i}><div className="aspect-square rounded-2xl bg-muted" /></div>)}
          </div>
        </div>
      </Layout>
    );
  }

  if (!category) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-24 text-center">
          <h1 className="font-display text-3xl font-semibold mb-4">Category Not Found</h1>
          <Button asChild><Link href="/categories">View All Categories</Link></Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-background">
        <div className="relative h-64 md:h-80 overflow-hidden">
          <img src={category.image_url || 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=1200'}
            alt={category.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-foreground/30 to-transparent" />
          <div className="absolute bottom-8 left-0 right-0 text-center">
            <h1 className="font-display text-4xl md:text-5xl font-semibold text-background">{category.name}</h1>
            {category.description && <p className="mt-2 text-background/80 max-w-md mx-auto">{category.description}</p>}
          </div>
        </div>

        <div className="container mx-auto px-4 py-12">
          <div className="flex justify-between items-center mb-8">
            <p className="text-muted-foreground">{products.length} {products.length === 1 ? 'product' : 'products'}</p>
            <Button asChild variant="ghost"><Link href="/categories">← All Categories</Link></Button>
          </div>
          {products.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-lg text-muted-foreground">No products in this category yet.</p>
              <Button asChild className="mt-4"><Link href="/shop">Browse All Products</Link></Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.map((product, index) => (
                <ProductCard key={product.id} product={product} style={{ animationDelay: `${index * 50}ms` } as React.CSSProperties} />
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
