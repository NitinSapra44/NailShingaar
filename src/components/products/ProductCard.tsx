'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
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
        'group relative flex h-full flex-col rounded-card bg-surface p-2.5 md:p-3',
        'transition-[transform,box-shadow] duration-300 ease-out hover:-translate-y-1 hover:shadow-hover',
        className,
      )}
      style={style}
    >
      {/* Media */}
      <div className="relative aspect-[4/5] overflow-hidden rounded-media bg-blush">
        {/* Hover-capable devices: first image, cross-fade to the second on hover */}
        <Link href={href} tabIndex={-1} aria-hidden className="absolute inset-0 hidden can-hover:block">
          <Image
            src={images[0]}
            alt={product.name}
            fill
            sizes={sizes}
            priority={priority}
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
          />
          {hasMultiple && (
            <Image
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
            <Carousel setApi={setApi} className="absolute inset-0">
              <CarouselContent className="ml-0">
                {images.map((src, i) => (
                  <CarouselItem key={src + i} className="pl-0 h-full">
                    <Link href={href} tabIndex={-1} className="relative block h-full w-full">
                      <Image
                        src={src}
                        alt={i === 0 ? product.name : ''}
                        fill
                        sizes={sizes}
                        priority={priority && i === 0}
                        className="object-cover"
                      />
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
              <Image src={images[0]} alt={product.name} fill sizes={sizes} priority={priority} className="object-cover" />
            </Link>
          )}
        </div>

        {/* Badges: only from real product data */}
        <div className="pointer-events-none absolute left-2.5 top-2.5 z-10 flex flex-col gap-1.5">
          {product.is_new && (
            <span className="rounded-full border border-gold bg-surface px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-gold-text">
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
          className="absolute right-2.5 top-2.5 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-surface/95 text-primary transition-colors hover:bg-primary-soft"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleWishlist(product.id);
          }}
          aria-label={inWishlist ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
          aria-pressed={inWishlist}
        >
          <Heart className={cn('h-4 w-4 transition-colors', inWishlist && 'fill-primary')} aria-hidden />
        </button>

        {/* Desktop "Buy Now": slides up on hover or keyboard focus */}
        <Link
          href={href}
          className={cn(
            'absolute inset-x-2.5 bottom-2.5 z-10 hidden h-10 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground',
            'can-hover:flex translate-y-[calc(100%+12px)] transition-[transform,background-color] duration-300 ease-out',
            'hover:bg-primary-hover group-hover:translate-y-0 focus-visible:translate-y-0',
          )}
        >
          Buy Now
        </Link>
      </div>

      {/* Info */}
      <div className="flex flex-1 flex-col px-1 pt-4">
        <h3 className="line-clamp-2 font-serif text-lg font-semibold leading-snug text-foreground md:text-xl lg:text-[22px]">
          <Link href={href} className="transition-colors hover:text-primary">
            {product.name}
          </Link>
        </h3>

        <div className="mt-2 flex flex-wrap items-baseline gap-x-2 gap-y-1">
          <span className="type-price">₹{product.price.toFixed(0)}</span>
          {!!product.original_price && (
            <span className="text-sm text-muted-foreground line-through">₹{product.original_price.toFixed(0)}</span>
          )}
        </div>

        <div className="mt-2.5 flex flex-1 flex-wrap content-end items-center justify-between gap-2">
          <span className="rounded-full bg-success-soft px-2.5 py-1 text-[11px] font-semibold text-success">
            Free Shipping
          </span>
          {/* Touch "Buy Now": always visible compact pill */}
          <Link
            href={href}
            className="inline-flex h-8 items-center rounded-full bg-primary px-3.5 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary-hover can-hover:hidden"
          >
            Buy Now
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
