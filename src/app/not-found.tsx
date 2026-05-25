'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-hero">
      <div className="text-center space-y-6 p-8">
        <h1 className="font-display text-8xl font-bold text-gradient">404</h1>
        <h2 className="font-display text-3xl font-semibold">Page Not Found</h2>
        <p className="text-muted-foreground max-w-md">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Button asChild size="lg" className="rounded-full shadow-soft">
          <Link href="/">Go Home</Link>
        </Button>
      </div>
    </div>
  );
}
