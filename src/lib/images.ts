// Smaller WebP copies of photos in the `product-images` bucket.
//
// The originals are 0.5–6 MB, far more than any card or gallery needs, and the
// free Supabase plan has no on-the-fly resizing. So every photo also gets
// pre-made copies at fixed widths, stored next to it:
//
//   products/123-abc.jpeg  ->  opt/w600/products/123-abc.webp
//                              opt/w1200/products/123-abc.webp
//
// Admin uploads create them (src/lib/image-upload.ts) and
// scripts/optimize-storage-images.py backfills older photos. Anything without a
// copy falls back to the original (see StorageImage).

export const IMAGE_WIDTHS = [600, 1200] as const;
export type ImageWidth = (typeof IMAGE_WIDTHS)[number];

/** A year: copies are never overwritten (new uploads get new names). */
export const IMMUTABLE_CACHE_SECONDS = '31536000';

const BUCKET = 'product-images';
const PUBLIC_PREFIX = `${process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''}/storage/v1/object/public/${BUCKET}/`;

/** Storage path of the copy, e.g. `opt/w600/products/123-abc.webp`. */
export function variantPath(path: string, width: ImageWidth): string {
  return `opt/w${width}/${path.replace(/\.[^./]+$/, '')}.webp`;
}

/** URL of the smaller copy for a bucket photo; any other URL is returned unchanged. */
export function optimizedImageUrl(url: string, width: ImageWidth): string {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !url.startsWith(PUBLIC_PREFIX)) return url;
  const path = url.slice(PUBLIC_PREFIX.length).split('?')[0];
  if (path.startsWith('opt/') || !/\.(jpe?g|png|webp|heic|heif)$/i.test(path)) return url;
  return PUBLIC_PREFIX + variantPath(path, width);
}
