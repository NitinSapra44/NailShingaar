'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Truck, Sparkles, Ruler, Play, Heart, Minus, Plus } from 'lucide-react';
import { Container, Section, SectionHeading, Breadcrumbs, Skeleton, Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui-kit';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext, type CarouselApi } from '@/components/ui/carousel';
import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/hooks/useCart';
import { useWishlist } from '@/hooks/useWishlist';
import { cn } from '@/lib/utils';
import { Product } from '@/types';

const DEFAULT_SIZE = 'Standard';

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [api, setApi] = useState<CarouselApi>();
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => {
    if (!slug) return;
    fetch(`/api/products/by-slug/${slug}`)
      .then((res) => res.json())
      .then((data) => {
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

  // Mobile sticky "Order Now" bar: shown once the main buttons scroll out of view (visual only).
  const buyButtonsRef = useRef<HTMLDivElement>(null);
  const [showStickyBar, setShowStickyBar] = useState(false);

  useEffect(() => {
    // A scroll check (not IntersectionObserver): IO misses jumps from below the
    // fold straight past the buttons, e.g. fast flicks or anchor links.
    let frame = 0;
    const update = () => {
      frame = 0;
      const el = buyButtonsRef.current;
      setShowStickyBar(!!el && el.getBoundingClientRect().bottom < 0);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [product]);

  // Lift the floating WhatsApp button above the mobile sticky bar while it's shown.
  useEffect(() => {
    const root = document.documentElement;
    const isMobile = window.matchMedia('(max-width: 767px)').matches;
    root.style.setProperty('--bottom-bar-offset', showStickyBar && isMobile ? '72px' : '0px');
    return () => {
      root.style.removeProperty("--bottom-bar-offset");
    };
  }, [showStickyBar]);

  const handleOrderClick = () => {
    if (!product) return;
    sessionStorage.setItem('checkout_product', JSON.stringify({ product, quantity }));
    router.push(user ? '/checkout' : '/auth?redirect=/checkout');
  };

  const handleAddToCart = async () => {
    if (!product) return;
    setAddingToCart(true);
    try {
      await addToCart(product.id, DEFAULT_SIZE, quantity);
    } finally {
      setAddingToCart(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <Container className="py-10 md:py-14">
          <Skeleton className="mb-8 h-4 w-48" />
          <div className="grid gap-10 md:grid-cols-[58fr_42fr] lg:gap-14" aria-busy="true">
            <Skeleton className="aspect-[4/5] rounded-card" />
            <div className="space-y-5">
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-6 w-1/4" />
              <Skeleton className="h-24" />
              <Skeleton className="h-12 rounded-full" />
              <Skeleton className="h-12 rounded-full" />
            </div>
          </div>
        </Container>
      </Layout>
    );
  }

  if (!product) {
    return (
      <Layout>
        <Section>
          <div className="py-12 text-center">
            <h1 className="type-h2 mb-6 text-foreground">Product Not Found</h1>
            <Button asChild><Link href="/shop">Back to Shop</Link></Button>
          </div>
        </Section>
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

  const thumb = (item: MediaItem, i: number, className: string) => (
    <button
      key={item.src + i}
      type="button"
      onClick={() => api?.scrollTo(i)}
      aria-label={`Show ${item.type === 'image' ? 'image' : 'video'} ${i + 1} of ${allMedia.length}`}
      aria-current={i === activeImage}
      className={cn(
        'relative aspect-square shrink-0 overflow-hidden rounded-media border transition-all',
        i === activeImage ? 'border-primary' : 'border-transparent opacity-60 hover:opacity-100',
        className,
      )}
    >
      {item.type === 'youtube' ? (
        <>
          <img src={`https://img.youtube.com/vi/${getYouTubeId(item.src)}/mqdefault.jpg`} alt="" className="h-full w-full object-cover" />
          <span className="absolute inset-0 flex items-center justify-center bg-ink/30"><Play className="h-5 w-5 text-white" aria-hidden /></span>
        </>
      ) : item.type === 'video' ? (
        <>
          <video src={item.src} className="h-full w-full object-cover" muted />
          <span className="absolute inset-0 flex items-center justify-center bg-ink/20"><Play className="h-5 w-5 text-white" aria-hidden /></span>
        </>
      ) : (
        <Image src={item.src} alt="" fill sizes="80px" priority={i === 0} className="object-cover" />
      )}
    </button>
  );

  const priceBlock = (
    <div className="flex items-baseline gap-3">
      <span className="font-sans text-2xl font-semibold text-primary">₹{product.price.toFixed(0)}</span>
      {!!product.original_price && (
        <span className="text-base text-muted-foreground line-through">₹{product.original_price.toFixed(0)}</span>
      )}
    </div>
  );

  return (
    <Layout>
      <Container className="pb-16 pt-8 md:pb-24 md:pt-10">
        <Breadcrumbs
          className="mb-6 md:mb-8"
          items={[{ label: 'Home', href: '/' }, { label: 'Shop', href: '/shop' }, { label: product.name }]}
        />

        <div className="grid gap-10 md:grid-cols-[58fr_42fr] lg:gap-14">
          {/* Gallery */}
          <div className={cn('grid gap-3', allMedia.length > 1 && 'lg:grid-cols-[72px_minmax(0,1fr)] lg:gap-4')}>
            <div className="relative aspect-[4/5] w-full overflow-hidden rounded-card bg-blush lg:col-start-2 lg:row-start-1">
              <Carousel setApi={setApi} className="absolute inset-0">
                <CarouselContent className="ml-0 h-full">
                  {allMedia.map((item, i) => (
                    <CarouselItem key={item.src + i} className="h-full pl-0">
                      {item.type === 'youtube' ? (
                        i === activeImage ? (
                          <iframe
                            src={`https://www.youtube.com/embed/${getYouTubeId(item.src)}?autoplay=1&mute=1&loop=1&playlist=${getYouTubeId(item.src)}&rel=0`}
                            title={`${product.name} video`}
                            allow="autoplay; encrypted-media"
                            allowFullScreen
                            className="h-full w-full border-0"
                          />
                        ) : (
                          <div className="relative h-full w-full">
                            <img src={`https://img.youtube.com/vi/${getYouTubeId(item.src)}/mqdefault.jpg`} alt="" className="h-full w-full object-cover" />
                            <div className="absolute inset-0 flex items-center justify-center bg-ink/30">
                              <Play className="h-10 w-10 text-white drop-shadow" aria-hidden />
                            </div>
                          </div>
                        )
                      ) : item.type === 'video' ? (
                        i === activeImage ? (
                          <video src={item.src} controls autoPlay muted loop playsInline className="h-full w-full object-cover" />
                        ) : (
                          <div className="relative h-full w-full">
                            <video src={item.src} className="h-full w-full object-cover" muted />
                            <div className="absolute inset-0 flex items-center justify-center bg-ink/20">
                              <Play className="h-10 w-10 text-white drop-shadow" aria-hidden />
                            </div>
                          </div>
                        )
                      ) : (
                        <div className="relative h-full w-full">
                          <Image
                            src={item.src}
                            alt={i === 0 ? product.name : `${product.name} — view ${i + 1}`}
                            fill
                            sizes="(max-width: 768px) 100vw, 55vw"
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
                    <CarouselPrevious className="left-4 hidden h-11 w-11 border-0 bg-surface/90 text-foreground hover:bg-surface md:flex" />
                    <CarouselNext className="right-4 hidden h-11 w-11 border-0 bg-surface/90 text-foreground hover:bg-surface md:flex" />
                  </>
                )}
              </Carousel>
              <div className="pointer-events-none absolute left-4 top-4 flex flex-col gap-2">
                {product.is_new && (
                  <span className="rounded-full border border-gold bg-surface px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-gold-text">
                    New Arrival
                  </span>
                )}
                {!!discount && (
                  <span className="rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">Save {discount}%</span>
                )}
              </div>
            </div>

            {allMedia.length > 1 && (
              <div className="flex gap-2 overflow-x-auto scrollbar-none lg:col-start-1 lg:row-start-1 lg:flex-col lg:overflow-visible">
                {allMedia.map((item, i) => thumb(item, i, 'w-16 lg:w-full'))}
              </div>
            )}
          </div>

          {/* Info (sticky on desktop) */}
          <div className="md:sticky md:top-28 md:self-start">
            <div className="flex items-start justify-between gap-4">
              <h1 className="font-serif text-[34px] font-medium leading-[1.1] text-foreground md:text-[44px]">{product.name}</h1>
              <button
                type="button"
                onClick={() => toggleWishlist(product.id)}
                aria-label={isInWishlist(product.id) ? 'Remove from wishlist' : 'Add to wishlist'}
                aria-pressed={isInWishlist(product.id)}
                className="mt-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-border bg-surface text-primary transition-colors hover:bg-primary-soft"
              >
                <Heart className={cn('h-5 w-5 transition-colors', isInWishlist(product.id) && 'fill-primary')} aria-hidden />
              </button>
            </div>

            <div className="mt-4">{priceBlock}</div>

            <div className="mt-6 flex gap-3 rounded-card border border-gold/40 bg-blush p-4">
              <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-gold" aria-hidden />
              <div>
                <p className="font-serif text-lg font-semibold text-foreground">100% Handcrafted &amp; Made to Order</p>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  After you order, we&apos;ll collect your nail size photos and preferences so this set is made perfectly for your hands.
                </p>
              </div>
            </div>

            <div className="mt-6 flex items-center gap-4">
              <span className="text-sm font-semibold text-foreground" id="qty-label">Quantity</span>
              <div className="flex items-center rounded-full border border-border bg-surface" role="group" aria-labelledby="qty-label">
                <Button variant="ghost" size="icon" className="h-10 w-10" type="button" aria-label="Decrease quantity"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}>
                  <Minus className="h-3.5 w-3.5" />
                </Button>
                <span className="w-8 text-center text-sm font-semibold" aria-live="polite">{quantity}</span>
                <Button variant="ghost" size="icon" className="h-10 w-10" type="button" aria-label="Increase quantity"
                  onClick={() => setQuantity((q) => q + 1)}>
                  <Plus className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>

            <div ref={buyButtonsRef} className="mt-6 flex flex-col gap-3">
              <Button size="lg" className="w-full" onClick={handleOrderClick}>
                Order Now <ArrowRight aria-hidden />
              </Button>
              <Button size="lg" variant="outline" className="w-full" onClick={handleAddToCart} disabled={addingToCart}>
                Add to Cart
              </Button>
            </div>

            <ul className="mt-8 grid grid-cols-3 gap-3 border-y border-border py-5">
              {[
                { icon: Ruler, text: 'Custom sized to your fingers' },
                { icon: Sparkles, text: 'Handcrafted with care' },
                { icon: Truck, text: 'Pan India delivery' },
              ].map((b) => (
                <li key={b.text} className="space-y-2 text-center">
                  <b.icon className="mx-auto h-5 w-5 text-gold" aria-hidden />
                  <p className="text-xs leading-tight text-muted-foreground">{b.text}</p>
                </li>
              ))}
            </ul>

            <Accordion type="multiple" defaultValue={product.description ? ['description'] : []} className="mt-2">
              {product.description && (
                <AccordionItem value="description">
                  <AccordionTrigger>Description</AccordionTrigger>
                  <AccordionContent>{product.description}</AccordionContent>
                </AccordionItem>
              )}
              <AccordionItem value="sizing">
                <AccordionTrigger>Sizing</AccordionTrigger>
                <AccordionContent>
                  Measure with our easy coin method — it takes about 2 minutes for all 10 nails.{' '}
                  <Link href="/size-guide" className="font-medium text-foreground underline decoration-gold underline-offset-4 hover:text-primary">
                    Read the Size Guide
                  </Link>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="shipping">
                <AccordionTrigger>Shipping &amp; Delivery</AccordionTrigger>
                <AccordionContent>
                  We ship across India. Regular orders arrive in 5–7 working days; custom orders take 7–10 working days after
                  payment confirmation. Shipping is free on orders above ₹999.{' '}
                  <Link href="/shipping" className="font-medium text-foreground underline decoration-gold underline-offset-4 hover:text-primary">
                    Shipping info
                  </Link>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="care">
                <AccordionTrigger>Care &amp; Reuse</AccordionTrigger>
                <AccordionContent>
                  With proper removal and care, our press-on nails can be worn 2–3 times. Always remove them gently using a
                  warm water soak or a cuticle pusher — never peel them off forcefully.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </Container>

      {/* How-To Video Section */}
      <Section tone="soft">
        <SectionHeading eyebrow="Watch & Learn" title="Everything You Need to Know" subtitle="Watch how it works — from unboxing to removal" />
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-3 md:gap-6">
          {[
            { id: 'ILw9ybGgfG8', title: 'What\'s in Your Order', desc: 'See exactly what you\'ll receive when your nails arrive' },
            { id: 'JO_TlkkN8Ss', title: 'How to Apply', desc: 'Step-by-step guide to applying your press-on nails perfectly' },
            { id: 'f5xDbG4KwmY', title: 'How to Remove', desc: 'Safe and easy removal without damaging your natural nails' },
          ].map((video) => (
            <figure key={video.id} className="mx-auto w-full max-w-[300px] sm:max-w-none">
              <div className="relative aspect-[9/16] overflow-hidden rounded-card bg-ink">
                <iframe
                  src={`https://www.youtube.com/embed/${video.id}?rel=0&modestbranding=1`}
                  title={video.title}
                  loading="lazy"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="absolute inset-0 h-full w-full border-0"
                />
              </div>
              <figcaption className="mt-4 text-center">
                <p className="font-serif text-xl font-semibold text-foreground">{video.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">{video.desc}</p>
              </figcaption>
            </figure>
          ))}
        </div>
      </Section>

      {/* Mobile sticky order bar */}
      <div
        className={cn(
          'fixed inset-x-0 bottom-0 z-40 border-t border-border bg-ivory/95 backdrop-blur-md transition-transform duration-300 ease-out md:hidden',
          showStickyBar ? 'translate-y-0' : 'translate-y-full',
        )}
        aria-hidden={!showStickyBar}
      >
        <div className="container flex items-center justify-between gap-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
          {priceBlock}
          <Button className="h-11 px-6" onClick={handleOrderClick} tabIndex={showStickyBar ? 0 : -1}>
            Order Now
          </Button>
        </div>
      </div>
    </Layout>
  );
}
