'use client';

import { useEffect, useState } from 'react';
import { StorageImage } from '@/components/ui-kit/StorageImage';
import Link from 'next/link';
import { Heart } from 'lucide-react';
import { Product } from '@/types';
import { cn } from '@/lib/utils';
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from '@/components/ui/carousel';
import { useWishlist } from '@/hooks/useWishlist';

interface ProductCardProps {
  product: Product;
  className?: string;
  style?: React.CSSProperties;
  priority?: boolean;
}

// Per-product ratings don't exist in the data model — the old "(4.8)" stars were
// hard-coded on every card, so they are intentionally not rendered.

const ProductCard = ({ product, className, style, priority }: ProductCardProps) => {
  const { isInWishlist, toggleWishlist } = useWishlist();
  const inWishlist = isInWishlist(product.id);
  const discount = product.original_price
    ? Math.round((1 - product.price / product.original_price) * 100)
    : null;

  const images = [product.image_url, ...(product.images ?? [])].filter(Boolean);
  const hasMultiple = images.length > 1;
  const href = `/product/${product.slug}`;

  const [api, setApi] = useState<CarouselApi>();
  const [activeIndex, setActiveIndex] = useState(0);
  // Only download photos the shopper is about to see: the hover image on first
  // hover, the next carousel slide once the shopper touches the card.
  const [hovered, setHovered] = useState(false);
  const [loadedUpTo, setLoadedUpTo] = useState(0);
  const preloadNext = () => setLoadedUpTo((n) => Math.max(n, activeIndex + 1));
  useEffect(() => {
    if (activeIndex > 0) setLoadedUpTo((n) => Math.max(n, activeIndex + 1));
  }, [activeIndex]);

  useEffect(() => {
    if (!api) return;
    const onSelect = () => setActiveIndex(api.selectedScrollSnap());
    onSelect();
    api.on('select', onSelect);
    return () => {
      api.off('select', onSelect);
    };
  }, [api]);

  const sizes = '(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw';

  return (
    <div
      className={cn(
        'group relative flex h-full flex-col',
        className,
      )}
      style={style}
    >
      {/* Media */}
      <div className="relative aspect-[4/5] overflow-hidden rounded-media bg-blush">
        {/* Hover-capable devices: first image, cross-fade to the second on hover */}
        <Link
          href={href}
          tabIndex={-1}
          aria-hidden
          className="absolute inset-0 hidden can-hover:block"
          onMouseEnter={() => setHovered(true)}
        >
          <StorageImage
            variant={600}
            src={images[0]}
            alt={product.name}
            fill
            sizes={sizes}
            priority={priority}
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
          />
          {hasMultiple && hovered && (
            <StorageImage
              variant={600}
              src={images[1]}
              alt=""
              fill
              sizes={sizes}
              className="object-cover opacity-0 transition-opacity duration-500 ease-out group-hover:opacity-100"
            />
          )}
        </Link>

        {/* Touch devices: keep the existing swipe carousel with dots */}
        <div className="absolute inset-0 can-hover:hidden">
          {hasMultiple ? (
            <Carousel setApi={setApi} className="absolute inset-0" onPointerDown={preloadNext}>
              <CarouselContent className="ml-0">
                {images.map((src, i) => (
                  <CarouselItem key={src + i} className="pl-0 h-full">
                    <Link href={href} tabIndex={-1} className="relative block h-full w-full">
                      {i <= loadedUpTo && <StorageImage
                        variant={600}
                        src={src}
                        alt={i === 0 ? product.name : ''}
                        fill
                        sizes={sizes}
                        priority={priority && i === 0}
                        className="object-cover"
                      />}
                    </Link>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <div className="absolute bottom-2.5 left-1/2 z-10 flex -translate-x-1/2 gap-1" aria-hidden>
                {images.map((_, i) => (
                  <span
                    key={i}
                    className={cn(
                      'h-1.5 rounded-full transition-all',
                      i === activeIndex ? 'w-4 bg-surface' : 'w-1.5 bg-surface/60',
                    )}
                  />
                ))}
              </div>
            </Carousel>
          ) : (
            <Link href={href} tabIndex={-1} className="relative block h-full w-full">
              <StorageImage variant={600} src={images[0]} alt={product.name} fill sizes={sizes} priority={priority} className="object-cover" />
            </Link>
          )}
        </div>

        {/* Badges: only from real product data */}
        <div className="pointer-events-none absolute left-2.5 top-2.5 z-10 flex flex-col gap-1.5">
          {product.is_new && (
            <span className="rounded-full bg-background px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-foreground">
              New
            </span>
          )}
          {!!discount && !product.is_new && (
            <span className="rounded-full bg-primary px-2.5 py-1 text-[10px] font-semibold tracking-wide text-primary-foreground">
              −{discount}%
            </span>
          )}
        </div>

        {/* Wishlist */}
        <button
          type="button"
          className="absolute right-2.5 top-2.5 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-background/90 text-foreground backdrop-blur transition-colors hover:text-primary"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleWishlist(product.id);
          }}
          aria-label={inWishlist ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
          aria-pressed={inWishlist}
        >
          <Heart className={cn('h-4 w-4 transition-colors', inWishlist && 'fill-primary text-primary')} aria-hidden />
        </button>

        {/* Desktop "Buy Now": slides up on hover or keyboard focus */}
        <Link
          href={href}
          className={cn(
            'absolute inset-x-2.5 bottom-2.5 z-10 hidden h-11 items-center justify-center rounded-full bg-foreground text-sm font-semibold text-background',
            'can-hover:flex translate-y-[calc(100%+12px)] transition-[transform,background-color] duration-300 ease-out',
            'hover:bg-primary group-hover:translate-y-0 focus-visible:translate-y-0',
          )}
        >
          Buy Now
        </Link>
      </div>

      {/* Info */}
      <div className="flex flex-1 flex-col pt-3.5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="line-clamp-2 text-[15px] font-medium leading-snug tracking-[-0.01em] text-foreground md:text-base">
            <Link href={href} className="transition-colors hover:text-primary">
              {product.name}
            </Link>
          </h3>
          <div className="shrink-0 text-right">
            <span className="type-price">₹{product.price.toFixed(0)}</span>
            {!!product.original_price && (
              <span className="block text-xs text-muted-foreground line-through">₹{product.original_price.toFixed(0)}</span>
            )}
          </div>
        </div>

        <div className="mt-1.5 flex flex-1 flex-wrap content-end items-center justify-between gap-2">
          <span className="text-xs text-success">Free shipping</span>
          {/* Touch "Buy Now": always visible compact pill */}
          <Link
            href={href}
            className="inline-flex h-8 items-center rounded-full bg-foreground px-3.5 text-xs font-semibold text-background transition-colors hover:bg-primary can-hover:hidden"
          >
            Buy Now
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
