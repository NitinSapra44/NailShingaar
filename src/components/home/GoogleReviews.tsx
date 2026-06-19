'use client';

import { Star } from 'lucide-react';

const reviews = [
  { src: '/reviews/review-1.png', alt: 'Google Review 1' },
  { src: '/reviews/review-2.png', alt: 'Google Review 2' },
  { src: '/reviews/review-3.png', alt: 'Google Review 3' },
  { src: '/reviews/review-4.png', alt: 'Google Review 4' },
];

export default function GoogleReviews() {
  return (
    <section className="py-16 bg-card border-y border-border">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Heading */}
        <div className="text-center mb-10">
          <p className="text-xs font-semibold tracking-[0.25em] text-muted-foreground uppercase mb-2">What Clients Say</p>
          <h2 className="font-display text-4xl md:text-6xl">GOOGLE REVIEWS</h2>
          <div className="flex items-center justify-center gap-1 mt-3">
            {[1,2,3,4,5].map((i) => (
              <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
            ))}
            <span className="ml-2 text-sm font-semibold text-muted-foreground">5.0 on Google</span>
          </div>
        </div>

        {/* Review screenshots */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {reviews.map((r) => (
            <div key={r.src} className="rounded-2xl overflow-hidden border border-border shadow-soft bg-background">
              <img
                src={r.src}
                alt={r.alt}
                className="w-full h-auto object-contain"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = 'none';
                  const parent = e.currentTarget.parentElement;
                  if (parent) {
                    parent.classList.add('min-h-[140px]', 'flex', 'items-center', 'justify-center');
                    parent.innerHTML = '<p class="text-xs text-muted-foreground p-4 text-center">Review screenshot coming soon</p>';
                  }
                }}
              />
            </div>
          ))}
        </div>

        <p className="text-center text-xs text-muted-foreground mt-5">
          Screenshots of verified Google Reviews from happy clients
        </p>
      </div>
    </section>
  );
}
