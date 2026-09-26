// Every phrase here already appears on the site (announcement bar, FAQ, About page).
const ITEMS = [
  'Custom sized to your fingers',
  'Handcrafted with love',
  'Reusable 2–3 times',
  'Free shipping above ₹999',
  'Bridal & everyday sets',
  'Pan-India delivery',
];

export default function Marquee() {
  // The list is rendered twice so the -50% translate loops seamlessly.
  const row = [...ITEMS, ...ITEMS];
  return (
    <section aria-label="Why Nail Shingaar" className="group overflow-hidden border-y border-border bg-background py-5 md:py-6">
      <ul className="flex w-max animate-marquee items-center group-hover:[animation-play-state:paused]">
        {row.map((item, i) => (
          <li
            key={`${item}-${i}`}
            aria-hidden={i >= ITEMS.length}
            className="flex shrink-0 items-center whitespace-nowrap font-display text-2xl font-medium tracking-[-0.03em] text-foreground md:text-4xl"
          >
            <span className="px-6 md:px-10">{item}</span>
            <span aria-hidden className="font-accent text-2xl italic text-primary md:text-4xl">✦</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
