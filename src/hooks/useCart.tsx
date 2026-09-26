import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { CartItem, Product } from '@/types';
import { useToast } from '@/hooks/use-toast';

interface LocalCartItem {
  productId: string;
  size: string;
  quantity: number;
  product?: Product;
}

interface CartContextType {
  items: (CartItem | LocalCartItem)[];
  loading: boolean;
  addToCart: (productId: string, size: string, quantity?: number) => Promise<void>;
  removeFromCart: (productId: string, size: string) => Promise<void>;
  updateQuantity: (productId: string, size: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [items, setItems] = useState<(CartItem | LocalCartItem)[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCart = async () => {
    if (!user) {
      const localCart = localStorage.getItem('cart');
      if (localCart) {
        const parsed = JSON.parse(localCart) as LocalCartItem[];
        // Fetch product details for local cart
        const productIds = parsed.map(item => item.productId);
        if (productIds.length > 0) {
          const { data: products } = await supabase
            .from('products')
            .select('*')
            .in('id', productIds);
          
          const itemsWithProducts = parsed.map(item => ({
            ...item,
            product: products?.find(p => p.id === item.productId)
          }));
          setItems(itemsWithProducts);
        }
      }
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('cart_items')
        .select(`
          *,
          product:products(*)
        `)
        .eq('user_id', user.id);

      if (error) throw error;
      setItems(data || []);
    } catch (error) {
      console.error('Error fetching cart:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [user]);

  const addToCart = async (productId: string, size: string, quantity = 1) => {
    if (!user) {
      const localCart = JSON.parse(localStorage.getItem('cart') || '[]') as LocalCartItem[];
      const existingIndex = localCart.findIndex(
        item => item.productId === productId && item.size === size
      );

      if (existingIndex >= 0) {
        localCart[existingIndex].quantity += quantity;
      } else {
        localCart.push({ productId, size, quantity });
      }

      localStorage.setItem('cart', JSON.stringify(localCart));
      await fetchCart();
      toast({ title: 'Added to cart!', description: 'Item has been added to your cart.' });
      return;
    }

    try {
      const { error } = await supabase
        .from('cart_items')
        .upsert({
          user_id: user.id,
          product_id: productId,
          size,
          quantity
        }, {
          onConflict: 'user_id,product_id,size'
        });

      if (error) throw error;
      await fetchCart();
      toast({ title: 'Added to cart!', description: 'Item has been added to your cart.' });
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast({ title: 'Error', description: 'Failed to add item to cart.', variant: 'destructive' });
    }
  };

  const removeFromCart = async (productId: string, size: string) => {
    if (!user) {
      const localCart = JSON.parse(localStorage.getItem('cart') || '[]') as LocalCartItem[];
      const filtered = localCart.filter(
        item => !(item.productId === productId && item.size === size)
      );
      localStorage.setItem('cart', JSON.stringify(filtered));
      await fetchCart();
      return;
    }

    try {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', user.id)
        .eq('product_id', productId)
        .eq('size', size);

      if (error) throw error;
      await fetchCart();
    } catch (error) {
      console.error('Error removing from cart:', error);
    }
  };

  const updateQuantity = async (productId: string, size: string, quantity: number) => {
    if (quantity <= 0) {
      await removeFromCart(productId, size);
      return;
    }

    if (!user) {
      const localCart = JSON.parse(localStorage.getItem('cart') || '[]') as LocalCartItem[];
      const index = localCart.findIndex(
        item => item.productId === productId && item.size === size
      );
      if (index >= 0) {
        localCart[index].quantity = quantity;
        localStorage.setItem('cart', JSON.stringify(localCart));
        await fetchCart();
      }
      return;
    }

    try {
      const { error } = await supabase
        .from('cart_items')
        .update({ quantity })
        .eq('user_id', user.id)
        .eq('product_id', productId)
        .eq('size', size);

      if (error) throw error;
      await fetchCart();
    } catch (error) {
      console.error('Error updating quantity:', error);
    }
  };

  const clearCart = async () => {
    if (!user) {
      localStorage.removeItem('cart');
      setItems([]);
      return;
    }

    try {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', user.id);

      if (error) throw error;
      setItems([]);
    } catch (error) {
      console.error('Error clearing cart:', error);
    }
  };

  const totalItems = items.reduce((sum, item) => sum + ('quantity' in item ? item.quantity : 0), 0);
  
  const totalPrice = items.reduce((sum, item) => {
    const product = 'product' in item ? item.product : undefined;
    const quantity = 'quantity' in item ? item.quantity : 0;
    return sum + (product?.price || 0) * quantity;
  }, 0);

  return (
    <CartContext.Provider value={{
      items,
      loading,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      totalItems,
      totalPrice
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
