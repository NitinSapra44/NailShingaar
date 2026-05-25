'use client';

import Link from 'next/link';
import { Trash2, Minus, Plus, ShoppingBag } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';

export default function CartPage() {
  const { items, loading, removeFromCart, updateQuantity, totalPrice } = useCart();
  const { user } = useAuth();

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
          <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground mb-6" />
          <h1 className="font-display text-3xl font-semibold mb-3">Your Cart is Empty</h1>
          <p className="text-muted-foreground mb-8">Explore our collections and order your first custom nail set!</p>
          <Button asChild size="lg" className="rounded-full">
            <Link href="/shop">Browse Collections</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  const checkoutHref = user ? '/checkout' : '/auth?redirect=/checkout';

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <h1 className="font-display text-3xl md:text-4xl font-semibold mb-8">Shopping Cart</h1>
        <div className="grid lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => {
              const product = 'product' in item ? item.product : undefined;
              const productId = 'product_id' in item ? item.product_id : (item as { productId: string }).productId;
              const { size, quantity } = item;
              if (!product) return null;
              return (
                <div key={`${productId}-${size}`} className="flex gap-4 p-4 rounded-2xl bg-card shadow-soft border border-border">
                  <Link href={`/product/${product.slug}`} className="flex-shrink-0">
                    <img src={product.image_url} alt={product.name} className="w-24 h-24 md:w-28 md:h-28 object-cover rounded-xl" />
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link href={`/product/${product.slug}`} className="font-medium hover:text-primary transition-colors leading-snug">
                      {product.name}
                    </Link>
                    <p className="text-sm text-muted-foreground mt-1">Size: {size}</p>
                    <p className="font-semibold mt-1 text-foreground">₹{product.price.toFixed(0)}</p>
                    <div className="flex items-center gap-3 mt-3">
                      <div className="flex items-center rounded-full border border-border">
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full"
                          onClick={() => updateQuantity(productId, size, quantity - 1)}>
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center text-sm font-medium">{quantity}</span>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full"
                          onClick={() => updateQuantity(productId, size, quantity + 1)}>
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => removeFromCart(productId, size)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-semibold">₹{(product.price * quantity).toFixed(0)}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-24 p-6 rounded-2xl bg-card shadow-card border border-border">
              <h2 className="font-display text-xl font-semibold mb-6">Order Summary</h2>
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>₹{totalPrice.toFixed(0)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="text-primary font-medium">{totalPrice >= 999 ? 'Free' : '₹99'}</span>
                </div>
                {totalPrice < 999 && (
                  <p className="text-xs text-muted-foreground bg-nude-light rounded-lg px-3 py-2">
                    Add ₹{(999 - totalPrice).toFixed(0)} more for free shipping!
                  </p>
                )}
                <div className="border-t border-border pt-3 flex justify-between font-semibold text-base">
                  <span>Total</span>
                  <span>₹{(totalPrice >= 999 ? totalPrice : totalPrice + 99).toFixed(0)}</span>
                </div>
              </div>
              <Button asChild className="w-full rounded-full shadow-soft hover:shadow-glow transition-shadow" size="lg">
                <Link href={checkoutHref}>Proceed to Checkout</Link>
              </Button>
              <p className="text-xs text-muted-foreground text-center mt-4">
                Custom sizing collected at checkout ✦ Secure UPI payment
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
