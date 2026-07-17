const press = [
  { name: 'Vogue', className: 'font-display text-xl md:text-2xl italic' },
  { name: 'Femina', className: 'font-display text-lg md:text-xl' },
  { name: 'Times of India', className: 'text-sm md:text-base font-semibold' },
  { name: 'Elle', className: 'font-display text-xl md:text-2xl italic tracking-wider' },
  { name: 'Cosmopolitan', className: 'text-sm md:text-base font-semibold' },
  { name: 'Lifestyle Asia', className: 'text-sm md:text-base font-semibold' },
];

const PressStrip = () => {
  return (
    <section className="py-12 bg-card border-y border-border">
      <div className="container mx-auto px-4">
        <p className="text-center text-[10px] text-muted-foreground/70 tracking-[0.3em] uppercase mb-8">
          As Featured In
        </p>
        <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12 lg:gap-16">
          {press.map((p) => (
            <span
              key={p.name}
              className={`text-muted-foreground/60 hover:text-foreground transition-colors duration-200 cursor-default ${p.className}`}
            >
              {p.name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PressStrip;
