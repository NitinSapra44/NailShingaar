import { supabase } from '@/integrations/supabase/client';
import { searchTermGroups } from '@/lib/search';
import type { Category } from '@/types';

/**
 * PostgREST `or` filters for a shopper's search: one filter per typed word,
 * each matching the product name or a collection the product is in. Apply
 * them all to require every word, or flattened into one to accept any word.
 * Shared by the shop page and the header's live suggestions.
 */
export async function productSearchClauses(query: string, categories?: Category[]): Promise<string[][]> {
  const groups = searchTermGroups(query);
  if (groups.length === 0) return [];

  const allCategories = categories ?? ((await supabase.from('categories').select('*')).data as Category[] | null) ?? [];
  const matches = (c: Category, terms: string[]) => terms.some((t) => c.name.toLowerCase().includes(t));

  const matchedIds = allCategories.filter((c) => groups.some((terms) => matches(c, terms))).map((c) => c.id);
  const productsByCategory = new Map<string, string[]>();
  if (matchedIds.length > 0) {
    const { data: rows } = await (supabase as any)
      .from('product_categories')
      .select('product_id, category_id')
      .in('category_id', matchedIds);
    for (const r of (rows ?? []) as { product_id: string; category_id: string }[]) {
      productsByCategory.set(r.category_id, [...(productsByCategory.get(r.category_id) ?? []), r.product_id]);
    }
  }

  return groups.map((terms) => {
    const ids = allCategories.filter((c) => matches(c, terms)).flatMap((c) => productsByCategory.get(c.id) ?? []);
    const clauses = terms.map((t) => `name.ilike.*${t}*`);
    if (ids.length > 0) clauses.push(`id.in.(${[...new Set(ids)].join(',')})`);
    return clauses;
  });
}
