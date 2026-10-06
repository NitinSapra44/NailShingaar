'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Layout from '@/components/layout/Layout';
import { StorageImg } from '@/components/ui-kit/StorageImage';
import ProductCard from '@/components/products/ProductCard';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Container, Section, Breadcrumbs, Skeleton, Reveal } from '@/components/ui-kit';
import { supabase } from '@/integrations/supabase/client';
import { Product, Category } from '@/types';

export default function CategoryDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState<'featured' | 'price-asc' | 'price-desc'>('featured');

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

  // Display-only sort over the products already loaded — no refetch.
  const sortedProducts = useMemo(() => {
    if (sort === 'featured') return products;
    const copy = [...products];
    copy.sort((a, b) => (sort === 'price-asc' ? a.price - b.price : b.price - a.price));
    return copy;
  }, [products, sort]);

  const grid = 'grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4 lg:gap-6';

  if (loading) {
    return (
      <Layout>
        <Skeleton className="h-72 w-full rounded-none md:h-96" />
        <Section aria-busy="true">
          <div className={grid}>
            {[...Array(4)].map((_, i) => (
              <div key={i} className="rounded-card bg-surface p-3">
                <Skeleton className="aspect-[4/5]" />
                <Skeleton className="mt-4 h-5 w-3/4" />
                <Skeleton className="mt-2 h-4 w-1/3" />
              </div>
            ))}
          </div>
        </Section>
      </Layout>
    );
  }

  if (!category) {
    return (
      <Layout>
        <Section>
          <div className="py-12 text-center">
            <h1 className="type-h2 mb-6 text-foreground">Category Not Found</h1>
            <Button asChild><Link href="/categories">View All Categories</Link></Button>
          </div>
        </Section>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="relative h-72 overflow-hidden md:h-96">
        <StorageImg
          variant={1200}
          loading="eager"
          src={category.image_url || 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=1200'}
          alt={`${category.name} press-on nails`}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/45 to-ink/10" aria-hidden />
        <Container className="absolute inset-x-0 bottom-0 pb-8 md:pb-12">
          <Breadcrumbs
            onDark
            items={[{ label: 'Home', href: '/' }, { label: 'Collections', href: '/categories' }, { label: category.name }]}
            className="mb-4"
          />
          <h1 className="type-display text-ivory">{category.name}</h1>
          {category.description && <p className="mt-3 max-w-[560px] text-base text-ivory/85 md:text-lg">{category.description}</p>}
        </Container>
      </div>

      <Section>
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-border pb-5">
          <div className="flex items-center gap-5">
            <Button asChild variant="link" className="group">
              <Link href="/categories">
                <ArrowLeft className="transition-transform group-hover:-translate-x-1" aria-hidden /> All Collections
              </Link>
            </Button>
            <p className="text-sm text-muted-foreground">
              {products.length} {products.length === 1 ? 'design' : 'designs'}
            </p>
          </div>
          {products.length > 1 && (
            <Select value={sort} onValueChange={(v) => setSort(v as typeof sort)}>
              <SelectTrigger className="h-10 w-[190px] rounded-full border-border bg-surface" aria-label="Sort products">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="featured">Featured</SelectItem>
                <SelectItem value="price-asc">Price: Low to High</SelectItem>
                <SelectItem value="price-desc">Price: High to Low</SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>

        {products.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-lg text-muted-foreground">No products in this category yet.</p>
            <Button asChild className="mt-6"><Link href="/shop">Browse All Products</Link></Button>
          </div>
        ) : (
          <div className={grid}>
            {sortedProducts.map((product, index) => (
              <Reveal key={product.id} delay={(index % 4) * 60}>
                <ProductCard product={product} priority={index < 2} />
              </Reveal>
            ))}
          </div>
        )}
      </Section>
    </Layout>
  );
}
