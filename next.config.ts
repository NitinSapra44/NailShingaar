import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
    ],
    // Product photos rarely change once uploaded — cache optimized output
    // for a week so the server doesn't keep re-fetching multi-MB originals
    // from Supabase Storage on every cache miss (Supabase egress quota).
    minimumCacheTTL: 60 * 60 * 24 * 7,
  },
};

export default nextConfig;
