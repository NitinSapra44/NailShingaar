'use client';

import { useState, useEffect, Suspense, Fragment } from 'react';
import { useSearchParams } from 'next/navigation';
import { Filter, SortAsc } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import ProductCard from '@/components/products/ProductCard';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Pagination, PaginationContent, PaginationItem, PaginationLink,
  PaginationNext, PaginationPrevious, PaginationEllipsis,
} from '@/components/ui/pagination';
import { supabase } from '@/integrations/supabase/client';
import { Product, Category } from '@/types';

const PAGE_SIZE = 12;

function ShopContent() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('newest');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const searchQuery = searchParams.get('search') || '';
  const featuredOnly = searchParams.get('featured') === 'true';

  // Filters changed — jump back to page 1.
  useEffect(() => {
    setPage(1);
  }, [searchQuery, featuredOnly, sortBy, selectedCategories]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const { data: categoriesData } = await supabase.from('categories').select('*');
        setCategories(categoriesData || []);

        let filteredProductIds: string[] | null = null;
        if (selectedCategories.length > 0) {
          const { data: junctionRows } = await (supabase as any)
            .from('product_categories')
            .select('product_id')
            .in('category_id', selectedCategories);
          filteredProductIds = ((junctionRows ?? []) as { product_id: string }[]).map((r) => r.product_id);
        }

        let query = supabase.from('products').select('*', { count: 'exact' });
        if (searchQuery) query = query.ilike('name', `%${searchQuery}%`);
        if (featuredOnly) query = query.eq('is_featured', true);
        if (filteredProductIds !== null) {
          if (filteredProductIds.length === 0) {
            setProducts([]);
            setTotalCount(0);
            setLoading(false);
            return;
          }
          query = query.in('id', filteredProductIds);
        }

        switch (sortBy) {
          case 'price-low': query = query.order('price', { ascending: true }); break;
          case 'price-high': query = query.order('price', { ascending: false }); break;
          case 'name': query = query.order('name', { ascending: true }); break;
          default: query = query.order('created_at', { ascending: false });
        }

        const from = (page - 1) * PAGE_SIZE;
        query = query.range(from, from + PAGE_SIZE - 1);

        const { data: productsData, error, count } = await query;
        if (error) throw error;
        setProducts(productsData || []);
        setTotalCount(count ?? 0);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [searchQuery, featuredOnly, sortBy, selectedCategories, page]);

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId) ? prev.filter((id) => id !== categoryId) : [...prev, categoryId]
    );
  };

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  const goToPage = (p: number) => {
    if (p < 1 || p > totalPages || p === page) return;
    setPage(p);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Windowed page numbers: first, last, current ± 1, with ellipses for gaps.
  const pageNumbers = (() => {
    const pages = new Set<number>([1, totalPages, page, page - 1, page + 1]);
    return [...pages].filter((p) => p >= 1 && p <= totalPages).sort((a, b) => a - b);
  })();

  return (
    <Layout>
      <div className="min-h-screen bg-background">
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
          <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
            <p className="text-muted-foreground">{totalCount} {totalCount === 1 ? 'product' : 'products'}</p>
            <div className="flex items-center gap-4">
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
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" className="lg:hidden"><Filter className="h-4 w-4 mr-2" />Filter</Button>
                </SheetTrigger>
                <SheetContent side="right">
                  <SheetHeader><SheetTitle>Filters</SheetTitle></SheetHeader>
                  <div className="mt-6 space-y-4">
                    <h4 className="font-medium">Categories</h4>
                    {categories.map((category) => (
                      <div key={category.id} className="flex items-center gap-2">
                        <Checkbox id={`mobile-${category.id}`} checked={selectedCategories.includes(category.id)}
                          onCheckedChange={() => toggleCategory(category.id)} />
                        <label htmlFor={`mobile-${category.id}`} className="text-sm cursor-pointer">{category.name}</label>
                      </div>
                    ))}
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>

          <div className="flex gap-8">
            <aside className="hidden lg:block w-64 flex-shrink-0">
              <div className="sticky top-24 space-y-6">
                <div>
                  <h4 className="font-display text-lg font-semibold mb-4">Categories</h4>
                  <div className="space-y-3">
                    {categories.map((category) => (
                      <div key={category.id} className="flex items-center gap-2">
                        <Checkbox id={category.id} checked={selectedCategories.includes(category.id)}
                          onCheckedChange={() => toggleCategory(category.id)} />
                        <label htmlFor={category.id} className="text-sm cursor-pointer hover:text-primary transition-colors">
                          {category.name}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                {selectedCategories.length > 0 && (
                  <Button variant="ghost" onClick={() => setSelectedCategories([])} className="w-full">
                    Clear Filters
                  </Button>
                )}
              </div>
            </aside>

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
                <>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                    {products.map((product, index) => (
                      <ProductCard key={product.id} product={product} style={{ animationDelay: `${index * 50}ms` } as React.CSSProperties} priority={index === 0} />
                    ))}
                  </div>

                  {totalPages > 1 && (
                    <Pagination className="mt-10">
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious
                            href="#"
                            onClick={(e) => { e.preventDefault(); goToPage(page - 1); }}
                            className={page === 1 ? 'pointer-events-none opacity-40' : ''}
                          />
                        </PaginationItem>
                        {pageNumbers.map((p, i) => (
                          <Fragment key={p}>
                            {i > 0 && pageNumbers[i - 1] < p - 1 && (
                              <PaginationItem>
                                <PaginationEllipsis />
                              </PaginationItem>
                            )}
                            <PaginationItem>
                              <PaginationLink
                                href="#"
                                isActive={p === page}
                                onClick={(e) => { e.preventDefault(); goToPage(p); }}
                              >
                                {p}
                              </PaginationLink>
                            </PaginationItem>
                          </Fragment>
                        ))}
                        <PaginationItem>
                          <PaginationNext
                            href="#"
                            onClick={(e) => { e.preventDefault(); goToPage(page + 1); }}
                            className={page === totalPages ? 'pointer-events-none opacity-40' : ''}
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={<Layout><div className="container mx-auto px-4 py-32 text-center"><div className="font-script text-3xl text-gradient animate-pulse">Loading…</div></div></Layout>}>
      <ShopContent />
    </Suspense>
  );
}
