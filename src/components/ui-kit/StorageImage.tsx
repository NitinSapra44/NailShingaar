'use client';

import { useEffect, useState } from 'react';
import Image, { type ImageProps } from 'next/image';
import { optimizedImageUrl, type ImageWidth } from '@/lib/images';

/** Picks the small copy of a bucket photo, falling back to the original if it doesn't exist. */
function useOptimizedSrc(src: string, variant: ImageWidth) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [src]);
  const optimized = optimizedImageUrl(src, variant);
  return {
    src: failed ? src : optimized,
    onError: () => {
      if (!failed && optimized !== src) setFailed(true);
    },
  };
}

type StorageImageProps = Omit<ImageProps, 'src'> & { src: string; variant: ImageWidth };

/** next/image for photos stored in Supabase: serves the WebP copy at `variant` width. */
export function StorageImage({ src, variant, onError, ...props }: StorageImageProps) {
  const opt = useOptimizedSrc(src, variant);
  return (
    <Image
      {...props}
      src={opt.src}
      onError={(e) => {
        opt.onError();
        onError?.(e);
      }}
    />
  );
}

type StorageImgProps = Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src'> & { src: string; variant: ImageWidth };

/** Plain <img> version for small fixed-size thumbnails (cart, wishlist, checkout). */
export function StorageImg({ src, variant, onError, alt, loading = 'lazy', ...props }: StorageImgProps) {
  const opt = useOptimizedSrc(src, variant);
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      {...props}
      alt={alt}
      loading={loading}
      decoding="async"
      src={opt.src}
      onError={(e) => {
        opt.onError();
        onError?.(e);
      }}
    />
  );
}
