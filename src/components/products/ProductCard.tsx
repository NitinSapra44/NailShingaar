'use client';

import Link from 'next/link';
import { Heart } from 'lucide-react';
import { Product } from '@/types';
import { cn } from '@/lib/utils';

interface ProductCardProps {
  product: Product;
  className?: string;
  style?: React.CSSProperties;
}

const StarIcon = () => (
  <svg className="h-3 w-3 fill-primary" viewBox="0 0 20 20">
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
);

const ProductCard = ({ product, className, style }: ProductCardProps) => {
  const discount = product.original_price
    ? Math.round((1 - product.price / product.original_price) * 100)
    : null;

  return (
    <div className={cn('group', className)} style={style}>
      <div className="bg-card rounded-2xl overflow-hidden shadow-soft hover:shadow-card transition-all duration-300">
        {/* Image */}
        <Link href={`/product/${product.slug}`} className="block relative aspect-square overflow-hidden">
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {product.is_new && (
              <span className="px-2.5 py-1 text-[10px] font-bold rounded-full bg-primary text-primary-foreground tracking-widest">
                JUST IN ♥
              </span>
            )}
            {!!discount && !product.is_new && (
              <span className="px-2.5 py-1 text-[10px] font-bold rounded-full bg-foreground text-background tracking-wider">
                -{discount}%
              </span>
            )}
          </div>

          {/* Heart - always visible */}
          <button
            className="absolute top-3 right-3 h-8 w-8 rounded-full bg-white/90 shadow-soft flex items-center justify-center hover:bg-pink-light transition-colors"
            onClick={(e) => e.preventDefault()}
            aria-label="Add to wishlist"
          >
            <Heart className="h-4 w-4 text-primary" />
          </button>
        </Link>

        {/* Info */}
        <div className="p-3 pt-2.5">
          <Link href={`/product/${product.slug}`}>
            <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors text-sm leading-snug line-clamp-1">
              {product.name}
            </h3>
          </Link>

          {/* Stars */}
          <div className="flex items-center gap-1 mt-1">
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map((s) => <StarIcon key={s} />)}
            </div>
            <span className="text-[10px] text-muted-foreground font-medium">(4.8)</span>
          </div>

          {/* Price */}
          <div className="flex items-center gap-2 mt-1.5">
            <span className="font-bold text-foreground">₹{product.price.toFixed(0)}</span>
            {!!product.original_price && (
              <span className="text-sm text-muted-foreground line-through">
                ₹{product.original_price.toFixed(0)}
              </span>
            )}
          </div>

          {/* Free Shipping */}
          <div className="mt-1.5">
            <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
              Free Shipping
            </span>
          </div>

          {/* Buy Now */}
          <Link
            href={`/product/${product.slug}`}
            className="mt-3 block w-full text-center py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity"
          >
            Buy Now
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
