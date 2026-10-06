'use client';

import { useEffect, useId, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, Loader2, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { StorageImg } from '@/components/ui-kit/StorageImage';
import { supabase } from '@/integrations/supabase/client';
import { productSearchClauses } from '@/lib/product-search';
import { cn } from '@/lib/utils';
import type { Category } from '@/types';

type Suggestion = { id: string; name: string; slug: string; price: number; image_url: string };

const MAX_SUGGESTIONS = 6;
const CANDIDATES = 30; // fetched, then ranked so literal name matches come first
const DEBOUNCE_MS = 200;
const QUICK_SEARCHES = ['Bridal', 'Pink', 'Gold', 'French', 'Red', 'Summer'];

/** Name starts with what was typed > a word starts with it > contains it > matched via synonym/collection. */
function rank(items: Suggestion[], typed: string): Suggestion[] {
  const words = typed.split(/\s+/).filter(Boolean);
  const score = (name: string) => {
    const n = name.toLowerCase();
    let s = 0;
    for (const w of words) {
      if (n.startsWith(w)) s += 3;
      else if (n.split(/[\s&-]+/).some((part) => part.startsWith(w))) s += 2;
      else if (n.includes(w)) s += 1;
    }
    return s;
  };
  // Stable sort keeps newest-first within equal scores.
  return items.map((item, i) => ({ item, i, s: score(item.name) }))
    .sort((a, b) => b.s - a.s || a.i - b.i)
    .map((x) => x.item);
}

/** Header search with live suggestions as the shopper types. */
export function HeaderSearch({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const listId = useId();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Suggestion[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [active, setActive] = useState(-1);
  const categories = useRef<Category[] | undefined>(undefined);
  const cache = useRef(new Map<string, Suggestion[]>());

  const trimmed = query.trim();

  // Load collections as soon as the box opens so the first suggestions are quick.
  useEffect(() => {
    supabase.from('categories').select('*').then(({ data }) => {
      categories.current ??= (data as Category[] | null) ?? undefined;
    });
  }, []);

  useEffect(() => {
    setActive(-1);
    if (trimmed.length < 2) {
      setResults(null);
      setLoading(false);
      return;
    }
    const key = trimmed.toLowerCase();
    const cached = cache.current.get(key);
    if (cached) {
      setResults(cached);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        categories.current ??= ((await supabase.from('categories').select('*')).data as Category[] | null) ?? [];
        const clauses = await productSearchClauses(trimmed, categories.current);
        const fetchMatches = async (matchAll: boolean) => {
          let q = supabase.from('products').select('id, name, slug, price, image_url');
          if (clauses.length > 0) {
            if (matchAll) for (const c of clauses) q = q.or(c.join(','));
            else q = q.or(clauses.flat().join(','));
          }
          const { data } = await q.order('created_at', { ascending: false }).limit(CANDIDATES);
          return (data ?? []) as Suggestion[];
        };
        let found = clauses.length === 0 ? [] : await fetchMatches(true);
        if (found.length === 0 && clauses.length > 1) found = await fetchMatches(false);
        found = rank(found, key).slice(0, MAX_SUGGESTIONS);
        cache.current.set(key, found);
        if (!cancelled) setResults(found);
      } catch (err) {
        console.error('[search] suggestions failed', err);
        if (!cancelled) setResults([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, DEBOUNCE_MS);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [trimmed]);

  const go = (href: string) => {
    router.push(href);
    onClose();
  };

  const showAll = (q = trimmed) => {
    if (q) go(`/shop?search=${encodeURIComponent(q)}`);
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (results && active >= 0 && results[active]) go(`/product/${results[active].slug}`);
    else showAll();
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      onClose();
      return;
    }
    if (!results?.length) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((i) => (i + 1) % results.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((i) => (i <= 0 ? results.length - 1 : i - 1));
    }
  };

  const open = results !== null || loading;

  return (
    <div id="site-search" className="border-t border-border bg-ivory">
      <div className="container py-3">
        <form onSubmit={onSubmit} className="flex items-center gap-3" role="search">
          <Search className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
          <Input
            type="search"
            placeholder="Search nails — try “bridal” or “pink”"
            aria-label="Search products"
            role="combobox"
            aria-expanded={open}
            aria-controls={listId}
            aria-autocomplete="list"
            aria-activedescendant={active >= 0 ? `${listId}-${active}` : undefined}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
            className="h-11 flex-1 rounded-full border-border bg-surface [&::-webkit-search-cancel-button]:appearance-none"
            autoComplete="off"
            autoFocus
          />
          {loading && <Loader2 className="h-4 w-4 shrink-0 animate-spin text-muted-foreground" aria-label="Searching" />}
        </form>

        {/* Quick searches before anything is typed */}
        {trimmed.length < 2 && (
          <div className="mt-3 flex flex-wrap items-center gap-2 pl-7">
            <span className="eyebrow mr-1">Popular</span>
            {QUICK_SEARCHES.map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => setQuery(q)}
                className="rounded-full border border-border bg-surface px-3 py-1 text-sm text-foreground transition-colors hover:border-foreground"
              >
                {q}
              </button>
            ))}
          </div>
        )}

        {results !== null && (
          <div className="mt-3 pl-7">
            {results.length === 0 ? (
              <p className="py-3 text-sm text-muted-foreground">
                {loading ? 'Searching…' : <>No designs match “{trimmed}”. Try a colour or occasion, like “gold” or “bridal”.</>}
              </p>
            ) : (
              <>
                <ul id={listId} role="listbox" aria-label="Suggested designs" className="grid gap-1 sm:grid-cols-2 lg:grid-cols-3">
                  {results.map((p, i) => (
                    <li key={p.id} id={`${listId}-${i}`} role="option" aria-selected={i === active}>
                      <Link
                        href={`/product/${p.slug}`}
                        onClick={onClose}
                        onMouseEnter={() => setActive(i)}
                        className={cn(
                          'flex items-center gap-3 rounded-media p-2 transition-colors',
                          i === active ? 'bg-blush' : 'hover:bg-blush',
                        )}
                      >
                        <StorageImg
                          variant={600}
                          src={p.image_url}
                          loading="eager"
                          alt=""
                          className="h-12 w-12 shrink-0 rounded-media bg-blush object-cover"
                        />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-medium text-foreground">{p.name}</span>
                          <span className="type-price block text-sm text-muted-foreground">₹{Number(p.price).toFixed(0)}</span>
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  onClick={() => showAll()}
                  className="mt-2 inline-flex items-center gap-1.5 py-2 text-sm font-semibold text-foreground hover:text-primary"
                >
                  See all results for “{trimmed}” <ArrowRight className="h-4 w-4" aria-hidden />
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
