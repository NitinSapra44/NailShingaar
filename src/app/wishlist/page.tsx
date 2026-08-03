'use client';

import Link from 'next/link';
import { Heart, ShoppingBag, Trash2 } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { useWishlist } from '@/hooks/useWishlist';
import { useCart } from '@/hooks/useCart';

const DEFAULT_SIZE = 'Standard';

export default function WishlistPage() {
  const { items, loading, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((n) => (
              <div key={n} className="flex gap-4 p-4 rounded-2xl bg-muted">
                <div className="w-24 h-24 rounded-xl bg-muted-foreground/10" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-3/4 bg-muted-foreground/10 rounded" />
                  <div className="h-4 w-1/4 bg-muted-foreground/10 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  if (items.length === 0) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-24 text-center">
          <Heart className="h-16 w-16 mx-auto text-muted-foreground mb-6" />
          <h1 className="font-display text-3xl font-semibold mb-3">Your Wishlist is Empty</h1>
          <p className="text-muted-foreground mb-8">Save the nail sets you love and order them anytime.</p>
          <Button asChild size="lg" className="rounded-full">
            <Link href="/shop">Browse Collections</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <h1 className="font-display text-3xl md:text-4xl font-semibold mb-8">My Wishlist</h1>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item) => {
            const { product, productId } = item;
            if (!product) return null;
            return (
              <div key={productId} className="p-4 rounded-2xl bg-card shadow-soft border border-border">
                <div className="flex gap-4">
                  <Link href={`/product/${product.slug}`} className="flex-shrink-0">
                    <img src={product.image_url} alt={product.name} className="w-24 h-24 object-cover rounded-xl" />
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link href={`/product/${product.slug}`} className="font-medium hover:text-primary transition-colors leading-snug line-clamp-2">
                      {product.name}
                    </Link>
                    <p className="font-semibold mt-1 text-foreground">₹{product.price.toFixed(0)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-4">
                  <Button size="sm" className="flex-1 rounded-full"
                    onClick={() => addToCart(product.id, DEFAULT_SIZE, 1)}>
                    <ShoppingBag className="h-3.5 w-3.5 mr-1.5" /> Add to Cart
                  </Button>
                  <Button variant="ghost" size="icon" className="h-9 w-9 text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => removeFromWishlist(productId)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Layout>
  );
}
