// Turns what a shopper types into match terms for the product search.
//
// Products have names only (no descriptions), so a literal name match misses
// most real searches ("red nails", "bridal set"). Each word is matched on its
// own, filler words are dropped, and common shopper words are widened to the
// names and collections Reet actually uses.

const STOP_WORDS = new Set([
  'nail', 'nails', 'press', 'presson', 'on', 'set', 'sets', 'design', 'designs', 'art',
  'the', 'a', 'an', 'and', 'for', 'with', 'of', 'in', 'my', 'me', 'look', 'style',
]);

// Lower-case word -> extra terms matched against product AND collection names.
const SYNONYMS: Record<string, string[]> = {
  red: ['crimson', 'cherry', 'ruby', 'laal', 'velvet'],
  pink: ['blush', 'rose', 'fuchsia', 'rosy'],
  gold: ['golden'],
  white: ['ivory', 'pearl', 'chandni'],
  blue: ['sapphire', 'ocean', 'coastal'],
  green: ['emerald'],
  purple: ['lilac'],
  nude: ['mocha', 'soft', 'luxe nude'],
  bridal: ['bride', 'maharani', 'bandhan', 'royal', 'heer', 'duchess', 'forever'],
  bride: ['bridal', 'maharani', 'bandhan', 'royal', 'heer'],
  wedding: ['bridal', 'maharani', 'bandhan', 'royal', 'heer'],
  shaadi: ['bridal', 'maharani', 'bandhan', 'heer'],
  festive: ['desi', 'festive'],
  diwali: ['desi', 'festive'],
  traditional: ['desi'],
  indian: ['desi'],
  summer: ['sunkissed', 'tropical', 'sunlit', 'sorbet'],
  beach: ['vacation', 'coastal', 'ocean', 'tropical'],
  holiday: ['vacation'],
  winter: ['cold', 'frost'],
  daily: ['daily edit', 'soft'],
  office: ['daily edit', 'soft', 'french'],
  simple: ['daily edit', 'soft', 'nude'],
  minimal: ['daily edit', 'soft', 'nude'],
  party: ['glam', 'glitter', 'bling'],
  glitter: ['bling', 'sparkle', 'glam'],
  flower: ['floral', 'bloom', 'blossom', 'petals'],
  floral: ['bloom', 'blossom', 'petals', 'flower'],
  heart: ['love'],
};

/** One group of terms per typed word; a product must match every group. */
export function searchTermGroups(query: string): string[][] {
  const words = query
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 1 && !STOP_WORDS.has(w));

  return words.map((word) => {
    // "bows" -> also "bow", "cherries" -> "cherr" (still matches "Cherry").
    const stem = word.length > 4 && word.endsWith('ies') ? word.slice(0, -3)
      : word.length > 3 && word.endsWith('s') ? word.slice(0, -1)
      : word;
    return [...new Set([word, stem, ...(SYNONYMS[word] ?? SYNONYMS[stem] ?? [])])];
  });
}
