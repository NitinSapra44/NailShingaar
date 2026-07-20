'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles } from 'lucide-react';

// 7:00 PM IST on July 22, 2026 = 13:30 UTC
const LAUNCH_TIME = new Date('2026-07-22T13:30:00.000Z').getTime();

function pad(n: number) {
  return String(n).padStart(2, '0');
}

function getTimeLeft() {
  const diff = Math.max(0, LAUNCH_TIME - Date.now());
  return {
    days:    Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours:   Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
    done:    diff === 0,
  };
}

export default function ComingSoonPage() {
  const router = useRouter();
  const [time, setTime] = useState(getTimeLeft);

  useEffect(() => {
    // If already past launch, send to homepage
    if (Date.now() >= LAUNCH_TIME) { router.replace('/'); return; }

    const id = setInterval(() => {
      const t = getTimeLeft();
      setTime(t);
      if (t.done) { clearInterval(id); router.replace('/'); }
    }, 1000);

    return () => clearInterval(id);
  }, [router]);

  return (
    <div className="min-h-screen bg-pink-light flex flex-col items-center justify-center px-4 text-center">
      {/* Logo */}
      <img src="/logo.png" alt="Nail Shingaar by Reet" className="h-20 w-auto object-contain mb-8" />

      <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-medium mb-6">
        <Sparkles className="h-3.5 w-3.5" /> Something beautiful is coming
      </div>

      <h1 className="font-display text-4xl md:text-6xl font-semibold text-foreground leading-tight mb-4">
        Launching Soon
      </h1>
      <p className="text-muted-foreground text-base md:text-lg max-w-sm mb-12">
        Handcrafted custom press-on nails, made perfectly for your fingers. We open at <strong>7 PM on July 22nd</strong> — stay tuned!
      </p>

      {/* Countdown */}
      <div className="flex items-end gap-4 md:gap-8">
        {[
          { label: 'Days',    value: time.days },
          { label: 'Hours',   value: time.hours },
          { label: 'Minutes', value: time.minutes },
          { label: 'Seconds', value: time.seconds },
        ].map(({ label, value }, i) => (
          <div key={label} className="flex items-end gap-4 md:gap-8">
            {i > 0 && <span className="text-3xl md:text-5xl font-display text-primary/40 mb-3">:</span>}
            <div className="flex flex-col items-center">
              <div className="w-20 md:w-28 h-20 md:h-28 rounded-2xl bg-white shadow-soft border border-primary/20 flex items-center justify-center">
                <span className="font-display text-3xl md:text-5xl font-semibold text-foreground tabular-nums">
                  {pad(value)}
                </span>
              </div>
              <span className="text-xs text-muted-foreground mt-2 font-medium uppercase tracking-widest">{label}</span>
            </div>
          </div>
        ))}
      </div>

      <p className="text-xs text-muted-foreground mt-16">
        © {new Date().getFullYear()} Nail Shingaar by Reet
      </p>
    </div>
  );
}
