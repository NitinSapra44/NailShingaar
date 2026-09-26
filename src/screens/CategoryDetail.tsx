import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Layout from '@/components/layout/Layout';
import ProductCard from '@/components/products/ProductCard';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Product, Category } from '@/types';

const CategoryDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!slug) return;

      try {
        // Fetch category
        const { data: categoryData, error: categoryError } = await supabase
          .from('categories')
          .select('*')
          .eq('slug', slug)
          .maybeSingle();

        if (categoryError) throw categoryError;
        setCategory(categoryData);

        if (categoryData) {
          // Fetch products in this category
          const { data: productsData, error: productsError } = await supabase
            .from('products')
            .select('*')
            .eq('category_id', categoryData.id)
            .order('created_at', { ascending: false });

          if (productsError) throw productsError;
          setProducts(productsData || []);
        }
      } catch (error) {
        console.error('Error fetching category:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [slug]);

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12">
          <div className="animate-pulse">
            <div className="h-8 w-48 bg-muted rounded mb-8" />
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i}>
                  <div className="aspect-square rounded-2xl bg-muted" />
                  <div className="mt-4 h-4 w-3/4 rounded bg-muted" />
                  <div className="mt-2 h-4 w-1/2 rounded bg-muted" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!category) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-24 text-center">
          <h1 className="font-display text-3xl font-semibold mb-4">Category Not Found</h1>
          <p className="text-muted-foreground mb-8">
            The category you're looking for doesn't exist.
          </p>
          <Button asChild>
            <Link to="/categories">View All Categories</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <>
      <Helmet>
        <title>{category.name} Press-On Nails | Nail Shingaar by Reet</title>
        <meta
          name="description"
          content={category.description || `Shop ${category.name} press-on nails at Nail Shingaar by Reet.`}
        />
      </Helmet>
      <Layout>
        <div className="min-h-screen bg-background">
          {/* Header */}
          <div className="relative h-64 md:h-80 overflow-hidden">
            <img
              src={category.image_url || 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=1200'}
              alt={category.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-foreground/30 to-transparent" />
            <div className="absolute bottom-8 left-0 right-0 text-center">
              <h1 className="font-display text-4xl md:text-5xl font-semibold text-background">
                {category.name}
              </h1>
              {category.description && (
                <p className="mt-2 text-background/80 max-w-md mx-auto">
                  {category.description}
                </p>
              )}
            </div>
          </div>

          <div className="container mx-auto px-4 py-12">
            <div className="flex justify-between items-center mb-8">
              <p className="text-muted-foreground">
                {products.length} {products.length === 1 ? 'product' : 'products'}
              </p>
              <Button asChild variant="ghost">
                <Link to="/categories">← All Categories</Link>
              </Button>
            </div>

            {products.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-lg text-muted-foreground">
                  No products in this category yet.
                </p>
                <Button asChild className="mt-4">
                  <Link to="/shop">Browse All Products</Link>
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {products.map((product, index) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    style={{ animationDelay: `${index * 50}ms` } as any}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </Layout>
    </>
  );
};

export default CategoryDetail;
