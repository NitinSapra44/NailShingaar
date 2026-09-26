'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

const MESSAGES = ['Handcrafted with love', 'Custom sizing for every hand', 'Free shipping above ₹999'];
const INTERVAL_MS = 4000;

export default function AnnouncementBar() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    setReducedMotion(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }, []);

  useEffect(() => {
    if (paused || reducedMotion) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % MESSAGES.length), INTERVAL_MS);
    return () => clearInterval(t);
  }, [paused, reducedMotion]);

  return (
    <div
      role="region"
      aria-label="Store announcements"
      className="bg-deep text-deep-foreground"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className="container relative flex h-9 items-center justify-center text-[13px] tracking-wide">
        {reducedMotion ? (
          // No auto-rotation for reduced-motion users: show every message at once.
          <p className="truncate text-center">{MESSAGES.join(' · ')}</p>
        ) : (
          MESSAGES.map((msg, i) => (
            <p
              key={msg}
              aria-hidden={i !== index}
              className={cn(
                'absolute inset-x-4 truncate text-center transition-opacity duration-500 ease-out',
                i === index ? 'opacity-100' : 'opacity-0',
              )}
            >
              {msg}
            </p>
          ))
        )}
      </div>
    </div>
  );
}
