import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { Product } from '@/types';
import { useToast } from '@/hooks/use-toast';

interface LocalWishlistItem {
  productId: string;
  product?: Product;
}

interface WishlistContextType {
  items: LocalWishlistItem[];
  loading: boolean;
  isInWishlist: (productId: string) => boolean;
  addToWishlist: (productId: string) => Promise<void>;
  removeFromWishlist: (productId: string) => Promise<void>;
  toggleWishlist: (productId: string) => Promise<void>;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [items, setItems] = useState<LocalWishlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWishlist = async () => {
    if (!user) {
      const localWishlist = localStorage.getItem('wishlist');
      if (localWishlist) {
        const productIds = JSON.parse(localWishlist) as string[];
        if (productIds.length > 0) {
          const { data: products } = await supabase
            .from('products')
            .select('*')
            .in('id', productIds);

          setItems(productIds.map((productId) => ({
            productId,
            product: products?.find((p) => p.id === productId),
          })));
        } else {
          setItems([]);
        }
      } else {
        setItems([]);
      }
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('wishlist')
        .select(`
          product_id,
          product:products(*)
        `)
        .eq('user_id', user.id);

      if (error) throw error;
      setItems((data || []).map((row) => ({ productId: row.product_id, product: row.product ?? undefined })));
    } catch (error) {
      console.error('Error fetching wishlist:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, [user]);

  const isInWishlist = (productId: string) => items.some((item) => item.productId === productId);

  const addToWishlist = async (productId: string) => {
    if (!user) {
      const localWishlist = JSON.parse(localStorage.getItem('wishlist') || '[]') as string[];
      if (!localWishlist.includes(productId)) {
        localWishlist.push(productId);
        localStorage.setItem('wishlist', JSON.stringify(localWishlist));
        await fetchWishlist();
      }
      toast({ title: 'Added to wishlist!', description: 'Item has been added to your wishlist.' });
      return;
    }

    try {
      const { error } = await supabase
        .from('wishlist')
        .upsert({ user_id: user.id, product_id: productId }, { onConflict: 'user_id,product_id' });

      if (error) throw error;
      await fetchWishlist();
      toast({ title: 'Added to wishlist!', description: 'Item has been added to your wishlist.' });
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      toast({ title: 'Error', description: 'Failed to add item to wishlist.', variant: 'destructive' });
    }
  };

  const removeFromWishlist = async (productId: string) => {
    if (!user) {
      const localWishlist = JSON.parse(localStorage.getItem('wishlist') || '[]') as string[];
      const filtered = localWishlist.filter((id) => id !== productId);
      localStorage.setItem('wishlist', JSON.stringify(filtered));
      await fetchWishlist();
      return;
    }

    try {
      const { error } = await supabase
        .from('wishlist')
        .delete()
        .eq('user_id', user.id)
        .eq('product_id', productId);

      if (error) throw error;
      await fetchWishlist();
    } catch (error) {
      console.error('Error removing from wishlist:', error);
    }
  };

  const toggleWishlist = async (productId: string) => {
    if (isInWishlist(productId)) {
      await removeFromWishlist(productId);
    } else {
      await addToWishlist(productId);
    }
  };

  return (
    <WishlistContext.Provider value={{
      items,
      loading,
      isInWishlist,
      addToWishlist,
      removeFromWishlist,
      toggleWishlist,
    }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};
