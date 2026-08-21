import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
    ],
    // Vercel's Image Optimization has a monthly transformation quota on
    // non-Enterprise plans; once it's exhausted, every /_next/image request
    // returns 402 regardless of the source being reachable. Serving images
    // unoptimized bypasses that billed pipeline entirely — no more resizing/
    // format conversion, but photos load unconditionally. Product photos
    // should still be pre-compressed at upload time (see ProductForm.tsx).
    unoptimized: true,
  },
};

export default nextConfig;
