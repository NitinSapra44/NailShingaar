'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Section, SectionHeading, Skeleton, Reveal, Accent } from '@/components/ui-kit';
import ProductCard from '@/components/products/ProductCard';
import { Product } from '@/types';

const FeaturedProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        const res = await fetch('/api/products?featured=true&pageSize=4&page=1');
        const { data } = await res.json();
        setProducts(data || []);
      } catch (error) {
        console.error('Error fetching featured products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, []);

  // Only 4 products are fetched, so tablet uses 2 columns (a 3-col row would leave an orphan).
  const grid = 'grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4 lg:gap-6';
  const heading = (
    <SectionHeading
      align="left"
      eyebrow="Most Loved"
      title={<>Our <Accent>Bestsellers</Accent></>}
      action={
        <Button asChild variant="link" className="group">
          <Link href="/shop?featured=true">
            View all <ArrowRight className="transition-transform group-hover:translate-x-1" aria-hidden />
          </Link>
        </Button>
      }
    />
  );

  if (loading) {
    return (
      <Section aria-busy="true">
        {heading}
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
    );
  }

  if (products.length === 0) return null;

  return (
    <Section>
      <Reveal>{heading}</Reveal>
      <div className={grid}>
        {products.map((product, index) => (
          <Reveal key={product.id} delay={index * 60}>
            <ProductCard product={product} priority={index === 0} />
          </Reveal>
        ))}
      </div>
    </Section>
  );
};

export default FeaturedProducts;
