'use client';

import { useState, useEffect, Suspense, Fragment } from 'react';
import { useSearchParams } from 'next/navigation';
import { Filter, SortAsc } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { PageHeader } from '@/components/ui-kit';
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
import { productSearchClauses } from '@/lib/product-search';

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
  // Set when no product matched every word, so we show products matching any of them.
  const [looseMatch, setLooseMatch] = useState(false);

  const searchQuery = searchParams.get('search') || '';
  const featuredOnly = searchParams.get('featured') === 'true';

  // Filters changed — jump back to page 1.
  useEffect(() => {
    setPage(1);
  }, [searchQuery, featuredOnly, sortBy, selectedCategories]);

  useEffect(() => {
    // Ignore responses from searches the shopper has already moved on from.
    let cancelled = false;
    const fetchData = async () => {
      setLoading(true);
      try {
        const { data: categoriesData } = await supabase.from('categories').select('*');
        if (cancelled) return;
        setCategories(categoriesData || []);
        const allCategories: Category[] = categoriesData || [];

        let filteredProductIds: string[] | null = null;
        if (selectedCategories.length > 0) {
          const { data: junctionRows } = await (supabase as any)
            .from('product_categories')
            .select('product_id')
            .in('category_id', selectedCategories);
          filteredProductIds = ((junctionRows ?? []) as { product_id: string }[]).map((r) => r.product_id);
        }

        // Each typed word must match the product name or one of its collections.
        const searchClauses = await productSearchClauses(searchQuery, allCategories);
        if (cancelled) return;

        const buildQuery = (matchAll: boolean) => {
          let query = supabase.from('products').select('*', { count: 'exact' });
          if (matchAll) for (const clauses of searchClauses) query = query.or(clauses.join(','));
          else query = query.or(searchClauses.flat().join(','));
          return query;
        };
        const query = buildQuery(true);
        if (filteredProductIds !== null && filteredProductIds.length === 0) {
          setProducts([]);
          setTotalCount(0);
          setLoading(false);
          return;
        }

        const from = (page - 1) * PAGE_SIZE;
        const finish = (q: ReturnType<typeof buildQuery>) => {
          if (featuredOnly) q = q.eq('is_featured', true);
          if (filteredProductIds !== null) q = q.in('id', filteredProductIds);
          switch (sortBy) {
            case 'price-low': q = q.order('price', { ascending: true }); break;
            case 'price-high': q = q.order('price', { ascending: false }); break;
            case 'name': q = q.order('name', { ascending: true }); break;
            default: q = q.order('created_at', { ascending: false });
          }
          return q.range(from, from + PAGE_SIZE - 1);
        };

        let { data: productsData, error, count } = await finish(query);
        let loose = false;
        if (!error && count === 0 && searchClauses.length > 1) {
          ({ data: productsData, error, count } = await finish(buildQuery(false)));
          loose = true;
        }
        if (cancelled) return;
        if (error) throw error;
        setLooseMatch(loose);
        setProducts(productsData || []);
        setTotalCount(count ?? 0);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchData();
    return () => { cancelled = true; };
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
        <PageHeader
          eyebrow={searchQuery ? 'Search' : 'Shop'}
          title={searchQuery ? `Results for "${searchQuery}"` : 'Shop All'}
          subtitle={
            looseMatch
              ? 'No design matched every word, so here are designs matching any of them.'
              : featuredOnly ? 'Our most loved designs' : 'Discover your perfect press-on nails'
          }
        />

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
                  <p className="text-lg text-muted-foreground">
                    {searchQuery ? `Nothing matched “${searchQuery}”` : 'No products found'}
                  </p>
                  {searchQuery && (
                    <p className="mt-2 text-sm text-muted-foreground">
                      Try a colour or occasion, like “pink”, “gold”, “bridal” or “french”.
                    </p>
                  )}
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
