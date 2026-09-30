'use client';

import { useEffect, useRef, useState } from 'react';
import { Pause, Play } from 'lucide-react';

// Silent, looping hero film. Captions are baked into the footage (top centre),
// so the frame is never cropped at the top. Respects prefers-reduced-motion
// and offers a pause control (WCAG 2.2.2).
export function HeroVideo() {
  const ref = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(true);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      v.pause();
      setPlaying(false);
    }
  }, []);

  const toggle = () => {
    const v = ref.current;
    if (!v) return;
    if (v.paused) {
      void v.play();
      setPlaying(true);
    } else {
      v.pause();
      setPlaying(false);
    }
  };

  return (
    <>
      <video
        ref={ref}
        className="absolute inset-0 h-full w-full object-cover"
        poster="/hero/hero-v3-poster.jpg"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        aria-label="A hand wearing blue-tipped almond press-on nails by Nail Shingaar"
      >
        <source src="/hero/hero-v3-720.mp4" type="video/mp4" media="(max-width: 767px)" />
        <source src="/hero/hero-v3-1080.mp4" type="video/mp4" />
      </video>
      <button
        type="button"
        onClick={toggle}
        aria-label={playing ? 'Pause video' : 'Play video'}
        className="absolute right-3 top-3 z-10 grid h-9 w-9 place-items-center rounded-full bg-ink/40 text-white backdrop-blur transition-colors hover:bg-ink/70 md:right-5 md:top-5"
      >
        {playing ? <Pause className="h-4 w-4" aria-hidden /> : <Play className="h-4 w-4" aria-hidden />}
      </button>
    </>
  );
}
