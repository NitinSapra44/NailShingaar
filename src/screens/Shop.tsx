import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Filter, SortAsc } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import ProductCard from '@/components/products/ProductCard';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/integrations/supabase/client';
import { Product, Category } from '@/types';

const Shop = () => {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('newest');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const searchQuery = searchParams.get('search') || '';
  const featuredOnly = searchParams.get('featured') === 'true';

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch categories
        const { data: categoriesData } = await supabase
          .from('categories')
          .select('*');
        setCategories(categoriesData || []);

        // Resolve product IDs matching selected categories via junction table
        let filteredProductIds: string[] | null = null;
        if (selectedCategories.length > 0) {
          const { data: junctionRows } = await supabase
            .from('product_categories')
            .select('product_id')
            .in('category_id', selectedCategories);
          filteredProductIds = (junctionRows ?? []).map((r) => r.product_id);
        }

        // Build products query
        let query = supabase.from('products').select('*');

        if (searchQuery) {
          query = query.ilike('name', `%${searchQuery}%`);
        }

        if (featuredOnly) {
          query = query.eq('is_featured', true);
        }

        if (filteredProductIds !== null) {
          if (filteredProductIds.length === 0) {
            setProducts([]);
            setLoading(false);
            return;
          }
          query = query.in('id', filteredProductIds);
        }

        // Apply sorting
        switch (sortBy) {
          case 'price-low':
            query = query.order('price', { ascending: true });
            break;
          case 'price-high':
            query = query.order('price', { ascending: false });
            break;
          case 'name':
            query = query.order('name', { ascending: true });
            break;
          default:
            query = query.order('created_at', { ascending: false });
        }

        const { data: productsData, error } = await query;
        if (error) throw error;
        setProducts(productsData || []);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [searchQuery, featuredOnly, sortBy, selectedCategories]);

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  return (
    <>
      <Helmet>
        <title>Shop Press-On Nails | Nail Shingaar by Reet</title>
        <meta
          name="description"
          content="Browse our collection of premium press-on nails. Find French tips, glitter, floral, and more unique designs."
        />
      </Helmet>
      <Layout>
        <div className="min-h-screen bg-background">
          {/* Header */}
          <div className="bg-gradient-card py-16">
            <div className="container mx-auto px-4 text-center">
              <h1 className="font-display text-4xl md:text-5xl font-semibold">
                {searchQuery ? `Results for "${searchQuery}"` : 'Shop All'}
              </h1>
              <p className="mt-2 text-muted-foreground">
                {featuredOnly ? 'Our most loved designs' : 'Discover your perfect press-on nails'}
              </p>
            </div>
          </div>

          <div className="container mx-auto px-4 py-12">
            {/* Toolbar */}
            <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
              <p className="text-muted-foreground">
                {products.length} {products.length === 1 ? 'product' : 'products'}
              </p>

              <div className="flex items-center gap-4">
                {/* Sort */}
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-40">
                    <SortAsc className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest</SelectItem>
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                    <SelectItem value="name">Name</SelectItem>
                  </SelectContent>
                </Select>

                {/* Filter (Mobile) */}
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" className="lg:hidden">
                      <Filter className="h-4 w-4 mr-2" />
                      Filter
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right">
                    <SheetHeader>
                      <SheetTitle>Filters</SheetTitle>
                    </SheetHeader>
                    <div className="mt-6 space-y-4">
                      <h4 className="font-medium">Categories</h4>
                      {categories.map((category) => (
                        <div key={category.id} className="flex items-center gap-2">
                          <Checkbox
                            id={`mobile-${category.id}`}
                            checked={selectedCategories.includes(category.id)}
                            onCheckedChange={() => toggleCategory(category.id)}
                          />
                          <label
                            htmlFor={`mobile-${category.id}`}
                            className="text-sm cursor-pointer"
                          >
                            {category.name}
                          </label>
                        </div>
                      ))}
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
            </div>

            <div className="flex gap-8">
              {/* Sidebar Filters (Desktop) */}
              <aside className="hidden lg:block w-64 flex-shrink-0">
                <div className="sticky top-24 space-y-6">
                  <div>
                    <h4 className="font-display text-lg font-semibold mb-4">Categories</h4>
                    <div className="space-y-3">
                      {categories.map((category) => (
                        <div key={category.id} className="flex items-center gap-2">
                          <Checkbox
                            id={category.id}
                            checked={selectedCategories.includes(category.id)}
                            onCheckedChange={() => toggleCategory(category.id)}
                          />
                          <label
                            htmlFor={category.id}
                            className="text-sm cursor-pointer hover:text-primary transition-colors"
                          >
                            {category.name}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {selectedCategories.length > 0 && (
                    <Button
                      variant="ghost"
                      onClick={() => setSelectedCategories([])}
                      className="w-full"
                    >
                      Clear Filters
                    </Button>
                  )}
                </div>
              </aside>

              {/* Products Grid */}
              <div className="flex-1">
                {loading ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="aspect-square rounded-2xl bg-muted" />
                        <div className="mt-4 h-4 w-3/4 rounded bg-muted" />
                        <div className="mt-2 h-4 w-1/2 rounded bg-muted" />
                      </div>
                    ))}
                  </div>
                ) : products.length === 0 ? (
                  <div className="text-center py-16">
                    <p className="text-lg text-muted-foreground">No products found</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
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
          </div>
        </div>
      </Layout>
    </>
  );
};

export default Shop;
