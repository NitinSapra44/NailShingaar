'use client';

import { Star } from 'lucide-react';

const reviews = [
  {
    name: 'Arushi Puri',
    initials: 'AP',
    color: 'bg-teal-500',
    badge: 'Local Guide',
    time: '3 years ago',
    text: "She's one of the oldest nail techs in the city. Her work is super neat and aesthetic. She's a fabulous teacher too. Do visit her to get the best service that too at reasonable prices.",
  },
  {
    name: 'Jeenia Jain',
    initials: 'JJ',
    color: 'bg-blue-500',
    badge: 'Local Guide',
    time: '3 years ago',
    text: 'Absolutely beautiful nail work by Reet! She made sure I was happy with my nails. My first and not last visit to Nail Shingaar. I would recommend her for her expertise and high-quality service!',
  },
  {
    name: 'Gunn Malhotra',
    initials: 'GM',
    color: 'bg-green-600',
    badge: null,
    time: '2 years ago',
    text: 'Nail shingaar is the best place for nails in the city. The best, comfy, cozy space where you can get any nail art you want. You wish and Reet will do it for you! You just blindly come to her place and trust me — you won\'t be disappointed.',
  },
  {
    name: 'Sachin Gambhir',
    initials: 'SG',
    color: 'bg-orange-500',
    badge: 'Local Guide',
    time: '11 months ago',
    text: 'Great nail artist and teacher. Highly recommend for anyone looking for beautiful custom nails done with care and precision.',
  },
  {
    name: 'Simran Kaur',
    initials: 'SK',
    color: 'bg-pink-500',
    badge: null,
    time: '10 months ago',
    text: 'Best in the town 🥰',
  },
  {
    name: 'MANAV LATH',
    initials: 'ML',
    color: 'bg-purple-600',
    badge: null,
    time: '3 years ago',
    text: "She's best in the business 👌",
  },
  {
    name: 'NITIKA Popley',
    initials: 'NP',
    color: 'bg-violet-500',
    badge: 'Local Guide',
    time: '3 years ago',
    text: 'She is best teacher and my bestfriend too ❤️',
  },
  {
    name: 'Aradhika Kaplish',
    initials: 'AK',
    color: 'bg-indigo-500',
    badge: null,
    time: '3 years ago',
    text: 'Best in the hood! ❤️',
  },
];

const GoogleG = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" aria-hidden>
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

const Stars = () => (
  <div className="flex items-center gap-0.5">
    {[1,2,3,4,5].map((i) => (
      <Star key={i} className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
    ))}
  </div>
);

export default function GoogleReviews() {
  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Heading */}
        <div className="text-center mb-10">
          <p className="text-xs font-semibold tracking-[0.25em] text-muted-foreground uppercase mb-2">What Clients Say</p>
          <h2 className="font-display text-4xl md:text-6xl">
            Real <span className="text-gradient">Reviews</span>
          </h2>
          <div className="flex items-center justify-center gap-1.5 mt-3">
            <Stars />
            <span className="text-sm font-semibold text-muted-foreground ml-1">5.0 on Google</span>
          </div>
        </div>

        {/* Review cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {reviews.map((r) => (
            <div
              key={r.name}
              className="flex flex-col gap-3 p-5 rounded-2xl border border-border bg-card shadow-soft hover:shadow-card transition-shadow duration-300"
            >
              {/* Top row: avatar + name + Google G */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`h-10 w-10 rounded-full ${r.color} flex items-center justify-center shrink-0`}>
                    <span className="text-white text-xs font-bold">{r.initials}</span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate leading-tight">{r.name}</p>
                    <p className="text-[11px] text-muted-foreground leading-tight mt-0.5">
                      {r.badge ? `${r.badge} · ` : ''}{r.time}
                    </p>
                  </div>
                </div>
                <GoogleG />
              </div>

              {/* Stars */}
              <Stars />

              {/* Review text */}
              <p className="text-sm text-foreground/80 leading-relaxed flex-1">{r.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
