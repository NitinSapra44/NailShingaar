const ITEMS = [
  'HANDCRAFTED',
  'CUSTOM SIZED',
  'MADE WITH LOVE',
  'CRUELTY FREE',
  'PAN INDIA DELIVERY',
  'REUSABLE',
  'BRIDAL DESIGNS',
  'LONG LASTING',
];

const MarqueeStrip = () => {
  const doubled = [...ITEMS, ...ITEMS];

  return (
    <div className="bg-primary overflow-hidden py-2 md:py-3.5 select-none">
      <div className="flex animate-marquee whitespace-nowrap">
        {doubled.map((item, i) => (
          <span key={i} className="inline-flex items-center text-primary-foreground">
            <span className="text-[9px] md:text-[11px] font-semibold tracking-[0.18em] md:tracking-[0.22em] px-4 md:px-6">{item}</span>
            <span className="text-primary-foreground/50 text-[9px] md:text-xs">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
};

export default MarqueeStrip;
