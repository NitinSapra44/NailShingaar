'use client';

import { useEffect, useRef, useState } from 'react';
import { Pause, Play } from 'lucide-react';

// Silent, looping hero film. Autoplays everywhere, including phones: if the
// browser blocks autoplay (iOS Low Power Mode, Android Data Saver) it retries
// on the first touch/scroll. A pause control is kept for WCAG 2.2.2.
export function HeroVideo() {
  const ref = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(true);
  // Set once the visitor pauses, so we never restart against their wishes.
  const userPaused = useRef(false);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;

    // iOS only autoplays inline, muted video; set both as properties too.
    v.muted = true;
    v.defaultMuted = true;
    v.playsInline = true;

    const kick = () => {
      if (userPaused.current || !v.paused) return;
      v.play().catch(() => {});
    };
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const onVisible = () => { if (document.visibilityState === 'visible') kick(); };
    const gestures = ['touchstart', 'pointerdown', 'scroll', 'keydown'] as const;

    v.addEventListener('play', onPlay);
    v.addEventListener('pause', onPause);
    document.addEventListener('visibilitychange', onVisible);
    gestures.forEach((e) => window.addEventListener(e, kick, { passive: true }));
    kick();

    return () => {
      v.removeEventListener('play', onPlay);
      v.removeEventListener('pause', onPause);
      document.removeEventListener('visibilitychange', onVisible);
      gestures.forEach((e) => window.removeEventListener(e, kick));
    };
  }, []);

  const toggle = () => {
    const v = ref.current;
    if (!v) return;
    if (v.paused) {
      userPaused.current = false;
      v.play().catch(() => {});
    } else {
      userPaused.current = true;
      v.pause();
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
