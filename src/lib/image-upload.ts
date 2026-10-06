import { supabase } from '@/integrations/supabase/client';
import { IMAGE_WIDTHS, IMMUTABLE_CACHE_SECONDS, variantPath } from '@/lib/images';

const BUCKET = 'product-images';

/**
 * Uploads a photo to the bucket plus its small WebP copies, and returns the
 * original's public URL. The copies are best effort: if the browser can't
 * encode WebP (older Safari) or storage refuses them, the site falls back to
 * the original and scripts/optimize-storage-images.py can fill them in later.
 */
export async function uploadPublicImage(path: string, file: File): Promise<string> {
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { upsert: false, cacheControl: IMMUTABLE_CACHE_SECONDS });
  if (error) throw error;

  await uploadVariants(path, file).catch((err) => console.warn('[images] small copies not created', err));

  return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
}

async function uploadVariants(path: string, file: File) {
  if (!file.type.startsWith('image/') || file.type === 'image/svg+xml') return;
  const bitmap = await createImageBitmap(file);
  try {
    for (const width of IMAGE_WIDTHS) {
      const scale = Math.min(1, width / bitmap.width);
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(bitmap.width * scale);
      canvas.height = Math.round(bitmap.height * scale);
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/webp', 0.8));
      if (!blob || blob.type !== 'image/webp') return; // browser can't encode WebP
      const { error } = await supabase.storage.from(BUCKET).upload(variantPath(path, width), blob, {
        upsert: true,
        contentType: 'image/webp',
        cacheControl: IMMUTABLE_CACHE_SECONDS,
      });
      if (error) throw error;
    }
  } finally {
    bitmap.close();
  }
}
