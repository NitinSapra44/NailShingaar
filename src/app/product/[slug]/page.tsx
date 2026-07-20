'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, Truck, Sparkles, Ruler } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Product } from '@/types';

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    if (!slug) return;
    supabase
      .from('products')
      .select('*')
      .eq('slug', slug)
      .maybeSingle()
      .then(({ data }) => {
        if (data) setProduct(data);
        setLoading(false);
      });
  }, [slug]);

  const handleOrderClick = () => {
    if (product) {
      sessionStorage.setItem('checkout_product', JSON.stringify(product));
      router.push('/checkout');
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12">
          <div className="grid md:grid-cols-2 gap-12 animate-pulse">
            <div className="aspect-video rounded-3xl bg-muted" />
            <div className="space-y-6">
              <div className="h-8 w-3/4 bg-muted rounded" />
              <div className="h-6 w-1/4 bg-muted rounded" />
              <div className="h-24 bg-muted rounded" />
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!product) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-24 text-center">
          <h1 className="font-display text-3xl font-semibold mb-4">Product Not Found</h1>
          <Button asChild><Link href="/shop">Back to Shop</Link></Button>
        </div>
      </Layout>
    );
  }

  const discount = product.original_price
    ? Math.round((1 - product.price / product.original_price) * 100)
    : null;

  const allImages = [product.image_url, ...(product.images ?? [])].filter(Boolean);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12 max-w-5xl">
        <div className="grid md:grid-cols-2 gap-12">
          <div className="space-y-3">
            <div className="relative aspect-video rounded-3xl overflow-hidden bg-gradient-card shadow-card">
              <img src={allImages[activeImage] ?? product.image_url} alt={product.name} className="w-full h-full object-cover" />
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {product.is_new && (
                  <span className="px-3 py-1 text-xs font-semibold rounded-full bg-accent text-accent-foreground">New Arrival</span>
                )}
                {!!discount && (
                  <span className="px-3 py-1 text-xs font-semibold rounded-full bg-primary text-primary-foreground">Save {discount}%</span>
                )}
              </div>
            </div>
            {allImages.length > 1 && (
              <div className="flex gap-2">
                {allImages.map((src, i) => (
                  <button key={src} onClick={() => setActiveImage(i)}
                    className={`aspect-square w-16 rounded-xl overflow-hidden border-2 transition-all ${i === activeImage ? 'border-primary' : 'border-transparent opacity-60 hover:opacity-100'}`}>
                    <img src={src} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div>
              <h1 className="font-display text-3xl md:text-4xl font-semibold">{product.name}</h1>
              <div className="flex items-baseline gap-3 mt-3">
                <span className="font-display text-3xl font-semibold text-foreground">₹{product.price.toFixed(0)}</span>
                {!!product.original_price && (
                  <span className="text-lg text-muted-foreground line-through">₹{product.original_price.toFixed(0)}</span>
                )}
              </div>
            </div>
            {product.description && (
              <p className="text-muted-foreground leading-relaxed">{product.description}</p>
            )}
            <div className="p-4 rounded-2xl bg-pink-light border border-primary/20 space-y-2">
              <p className="font-semibold text-sm text-primary flex items-center gap-2">
                <Sparkles className="h-4 w-4" /> 100% Handcrafted & Made to Order
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                After you order, we&apos;ll collect your nail size photos and preferences so this set is made perfectly for your hands.
              </p>
            </div>
            <Button size="lg" className="w-full rounded-full shadow-soft hover:shadow-glow transition-shadow text-base" onClick={handleOrderClick}>
              Order This Set <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <div className="grid grid-cols-3 gap-3 pt-2 border-t border-border">
              {[
                { icon: Ruler, text: 'Custom sized to your fingers' },
                { icon: Sparkles, text: 'Handcrafted with care' },
                { icon: Truck, text: 'Pan India delivery' },
              ].map((b) => (
                <div key={b.text} className="text-center space-y-1.5">
                  <b.icon className="h-5 w-5 mx-auto text-primary" />
                  <p className="text-xs text-muted-foreground leading-tight">{b.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
