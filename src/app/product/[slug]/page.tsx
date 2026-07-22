'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Truck, Sparkles, Ruler, Play } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext, type CarouselApi } from '@/components/ui/carousel';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Product } from '@/types';

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [api, setApi] = useState<CarouselApi>();

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

  useEffect(() => {
    if (!api) return;
    const onSelect = () => setActiveImage(api.selectedScrollSnap());
    onSelect();
    api.on('select', onSelect);
    return () => {
      api.off('select', onSelect);
    };
  }, [api]);

  const handleOrderClick = () => {
    if (!product) return;
    sessionStorage.setItem('checkout_product', JSON.stringify(product));
    router.push(user ? '/checkout' : '/auth?redirect=/checkout');
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

  // Extract YouTube video ID from any YouTube URL format
  const getYouTubeId = (url: string): string | null => {
    const m = url.match(
      /(?:youtube\.com\/(?:watch\?v=|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
    );
    return m ? m[1] : null;
  };

  const classifyVideo = (src: string): 'youtube' | 'video' =>
    getYouTubeId(src) ? 'youtube' : 'video';

  type MediaItem = { src: string; type: 'image' | 'video' | 'youtube' };
  const allMedia: MediaItem[] = [
    { src: product.image_url, type: 'image' as const },
    ...(product.images ?? []).map((src): MediaItem => ({ src, type: 'image' })),
    ...(product.videos ?? []).filter(Boolean).map((src): MediaItem => ({ src, type: classifyVideo(src) })),
  ].filter((m) => Boolean(m.src));

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12 max-w-5xl">
        <div className="grid md:grid-cols-2 gap-12">
          <div className="space-y-3">
            <div className="relative aspect-video rounded-3xl overflow-hidden bg-gradient-card shadow-card">
              <Carousel setApi={setApi} className="absolute inset-0">
                <CarouselContent className="ml-0 h-full">
                  {allMedia.map((item, i) => (
                    <CarouselItem key={item.src + i} className="pl-0 h-full">
                      {item.type === 'youtube' ? (
                        i === activeImage ? (
                          <iframe
                            src={`https://www.youtube.com/embed/${getYouTubeId(item.src)}?autoplay=1&mute=1&loop=1&playlist=${getYouTubeId(item.src)}&rel=0`}
                            allow="autoplay; encrypted-media"
                            allowFullScreen
                            className="w-full h-full border-0"
                          />
                        ) : (
                          <div className="relative w-full h-full">
                            <img
                              src={`https://img.youtube.com/vi/${getYouTubeId(item.src)}/mqdefault.jpg`}
                              alt="video thumbnail"
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                              <Play className="h-10 w-10 text-white drop-shadow" />
                            </div>
                          </div>
                        )
                      ) : item.type === 'video' ? (
                        i === activeImage ? (
                          <video
                            src={item.src}
                            controls
                            autoPlay
                            muted
                            loop
                            playsInline
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="relative w-full h-full">
                            <video src={item.src} className="w-full h-full object-cover" muted />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                              <Play className="h-10 w-10 text-white drop-shadow" />
                            </div>
                          </div>
                        )
                      ) : (
                        <div className="relative w-full h-full">
                          <Image
                            src={item.src}
                            alt={product.name}
                            fill
                            sizes="(max-width: 768px) 100vw, 50vw"
                            priority={i === 0}
                            className="object-cover"
                          />
                        </div>
                      )}
                    </CarouselItem>
                  ))}
                </CarouselContent>
                {allMedia.length > 1 && (
                  <>
                    <CarouselPrevious className="left-3 hidden md:flex" />
                    <CarouselNext className="right-3 hidden md:flex" />
                  </>
                )}
              </Carousel>
              <div className="absolute top-4 left-4 flex flex-col gap-2 pointer-events-none">
                {product.is_new && (
                  <span className="px-3 py-1 text-xs font-semibold rounded-full bg-accent text-accent-foreground">New Arrival</span>
                )}
                {!!discount && (
                  <span className="px-3 py-1 text-xs font-semibold rounded-full bg-primary text-primary-foreground">Save {discount}%</span>
                )}
              </div>
            </div>
            {allMedia.length > 1 && (
              <div className="flex gap-2 flex-wrap">
                {allMedia.map((item, i) => (
                  <button key={item.src + i} onClick={() => api?.scrollTo(i)}
                    className={`relative aspect-square w-16 rounded-xl overflow-hidden border-2 transition-all ${i === activeImage ? 'border-primary' : 'border-transparent opacity-60 hover:opacity-100'}`}>
                    {item.type === 'youtube' ? (
                      <>
                        <img
                          src={`https://img.youtube.com/vi/${getYouTubeId(item.src)}/mqdefault.jpg`}
                          alt="video thumbnail"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                          <Play className="h-5 w-5 text-white drop-shadow" />
                        </div>
                      </>
                    ) : item.type === 'video' ? (
                      <>
                        <video src={item.src} className="w-full h-full object-cover" muted />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                          <Play className="h-5 w-5 text-white drop-shadow" />
                        </div>
                      </>
                    ) : (
                      <Image src={item.src} alt="" fill sizes="64px" className="object-cover" />
                    )}
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

        {/* How-To Video Section */}
        <div className="mt-16 pt-12 border-t border-border">
          <div className="text-center mb-8">
            <h2 className="font-display text-2xl md:text-3xl font-semibold mb-2">Everything You Need to Know</h2>
            <p className="text-muted-foreground text-sm">Watch how it works — from unboxing to removal</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { id: 'ILw9ybGgfG8', title: 'What\'s in Your Order', desc: 'See exactly what you\'ll receive when your nails arrive' },
              { id: 'JO_TlkkN8Ss', title: 'How to Apply', desc: 'Step-by-step guide to applying your press-on nails perfectly' },
              { id: 'f5xDbG4KwmY', title: 'How to Remove', desc: 'Safe and easy removal without damaging your natural nails' },
            ].map((video, i) => (
              <div key={i} className="space-y-3">
                <div className="relative mx-auto rounded-2xl overflow-hidden shadow-soft border border-border bg-black" style={{ aspectRatio: '9/16', maxHeight: '480px' }}>
                  <iframe
                    src={`https://www.youtube.com/embed/${video.id}?rel=0&modestbranding=1`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full border-0"
                  />
                </div>
                <div className="text-center px-2">
                  <p className="font-semibold text-sm">{video.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{video.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
