'use client';

import Link from 'next/link';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Product } from '@/types';
import { cn } from '@/lib/utils';

interface ProductCardProps {
  product: Product;
  className?: string;
  style?: React.CSSProperties;
}

const ProductCard = ({ product, className, style }: ProductCardProps) => {
  const discount = product.original_price
    ? Math.round((1 - product.price / product.original_price) * 100)
    : null;

  return (
    <div className={cn('group relative animate-fade-up', className)} style={style}>
      <Link href={`/product/${product.slug}`} className="block">
        {/* Image */}
        <div className="relative aspect-square rounded-2xl overflow-hidden bg-gradient-card shadow-soft group-hover:shadow-card transition-shadow duration-300">
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {product.is_new && (
              <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-champagne text-accent-foreground">
                New
              </span>
            )}
            {!!discount && (
              <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-primary text-primary-foreground">
                -{discount}%
              </span>
            )}
          </div>

          {/* Wishlist */}
          <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <Button
              size="icon"
              variant="secondary"
              className="h-8 w-8 rounded-full shadow-soft bg-card/90 hover:bg-rose-gold-light"
              onClick={(e) => e.preventDefault()}
            >
              <Heart className="h-4 w-4 text-primary" />
            </Button>
          </div>

          {/* Quick view overlay */}
          <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
            <Button className="w-full rounded-full shadow-soft text-xs h-9" size="sm">
              Order This Set
            </Button>
          </div>
        </div>

        {/* Info */}
        <div className="mt-3 space-y-1">
          <h3 className="font-medium text-foreground group-hover:text-primary transition-colors text-sm leading-snug">
            {product.name}
          </h3>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-foreground">₹{product.price.toFixed(0)}</span>
            {!!product.original_price && (
              <span className="text-sm text-muted-foreground line-through">
                ₹{product.original_price.toFixed(0)}
              </span>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
};

export default ProductCard;
