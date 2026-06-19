import Link from 'next/link';
import { ShoppingBag, Sparkles, CreditCard, Package, ArrowRight, Clock, CheckCircle2, Star } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';

export const metadata = {
  title: 'How to Order | Nail Shingaar by Reet',
  description: 'Learn how to place a regular or custom press-on nail order at Nail Shingaar by Reet.',
};

const shopSteps = [
  {
    icon: ShoppingBag,
    title: 'Browse the Shop',
    description: 'Explore our collections — from everyday basics to bridal sets. Filter by shape, length, or occasion. Click any design to see details.',
  },
  {
    icon: Package,
    title: 'Choose Your Specs',
    description: 'Select your nail shape (Square, Round, Almond, Coffin…) and length (Small, Medium, Long). Upload 4 nail photos using the coin method for a perfect fit.',
  },
  {
    icon: CreditCard,
    title: 'Checkout & Pay',
    description: 'Enter your shipping address and pay via UPI. Upload a screenshot of the payment as confirmation — Reet will verify and begin crafting.',
  },
  {
    icon: Package,
    title: 'Receive Your Set',
    description: "Your handcrafted set is carefully packaged and shipped to you within 3–5 working days. You'll receive tracking information once dispatched.",
  },
];

const customSteps = [
  {
    icon: Sparkles,
    title: 'Submit Your Enquiry',
    description: 'Head to the Custom Order page. Upload your design reference (inspo photos, mood board, sketches — anything that captures your vision), choose your shape and length, and add any style notes.',
  },
  {
    icon: Package,
    title: 'Upload Nail Sizing Photos',
    description: 'Follow the coin method to photograph all 10 fingers (4 photos total). This ensures your custom set fits your nails perfectly.',
  },
  {
    icon: Clock,
    title: 'Receive Your Price Quote',
    description: 'Reet reviews your design and will get in touch via WhatsApp or call to discuss the design and confirm a price. Custom sets are priced based on complexity and materials.',
  },
  {
    icon: CreditCard,
    title: 'Pay & Start Crafting',
    description: 'Once you agree on the price, pay via UPI from your Orders page. Upload your payment screenshot and Reet will begin crafting your one-of-a-kind set.',
  },
  {
    icon: Package,
    title: 'Receive Your Custom Set',
    description: 'Custom sets are shipped within 5–7 working days after payment confirmation. Worth every day of the wait!',
  },
];

export default function HowToOrderPage() {
  return (
    <Layout>
      {/* Hero */}
      <section className="bg-ink-light border-b border-border">
        <div className="container mx-auto px-4 py-14 max-w-4xl">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h1 className="font-display text-4xl font-semibold mb-3">How to Order</h1>
              <p className="text-muted-foreground text-lg leading-relaxed">
                Two ways to get your dream nails — a ready-made design from the shop,
                or a fully custom set made just for you.
              </p>
            </div>
            <div className="rounded-2xl overflow-hidden shadow-card">
              <img
                src="https://images.unsplash.com/photo-1604654894610-df63bc536371?w=600&h=380&fit=crop&q=80"
                alt="Custom press-on nails by Nail Shingaar"
                className="w-full h-52 md:h-60 object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Regular Shop Order */}
      <section className="container mx-auto px-4 py-14 max-w-3xl">
        <div className="flex items-center gap-3 mb-8">
          <div className="h-10 w-10 rounded-full bg-pink-light flex items-center justify-center">
            <ShoppingBag className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="font-display text-2xl font-semibold">Shop Order</h2>
            <p className="text-sm text-muted-foreground">Browse a design you love and order it</p>
          </div>
        </div>

        <div className="space-y-4">
          {shopSteps.map((step, i) => {
            const Icon = step.icon;
            return (
              <div key={step.title} className="flex gap-5 p-6 rounded-2xl bg-card border border-border shadow-soft">
                <div className="flex flex-col items-center gap-2 shrink-0">
                  <div className="h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
                    {i + 1}
                  </div>
                  {i < shopSteps.length - 1 && <div className="w-0.5 flex-1 min-h-[24px] bg-border rounded-full" />}
                </div>
                <div className="pb-2">
                  <div className="flex items-center gap-2 mb-1">
                    <Icon className="h-4 w-4 text-primary" />
                    <h3 className="font-semibold text-base">{step.title}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 flex justify-center">
          <Button asChild className="rounded-full shadow-soft hover:shadow-glow">
            <Link href="/shop">Browse Shop <ArrowRight className="ml-2 h-4 w-4" /></Link>
          </Button>
        </div>
      </section>

      {/* Custom Order */}
      <section className="bg-ink-light border-y border-border">
        <div className="container mx-auto px-4 py-14 max-w-3xl">
          <div className="flex items-center gap-3 mb-8">
            <div className="h-10 w-10 rounded-full bg-pink-light flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="font-display text-2xl font-semibold">Custom Design Order</h2>
              <p className="text-sm text-muted-foreground">Upload your vision — Reet crafts it for you</p>
            </div>
          </div>

          <div className="space-y-4">
            {customSteps.map((step, i) => {
              const Icon = step.icon;
              return (
                <div key={step.title} className="flex gap-5 p-6 rounded-2xl bg-card border border-primary/20 shadow-soft">
                  <div className="flex flex-col items-center gap-2 shrink-0">
                    <div className="h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
                      {i + 1}
                    </div>
                    {i < customSteps.length - 1 && <div className="w-0.5 flex-1 min-h-[24px] bg-primary/20 rounded-full" />}
                  </div>
                  <div className="pb-2">
                    <div className="flex items-center gap-2 mb-1">
                      <Icon className="h-4 w-4 text-primary" />
                      <h3 className="font-semibold text-base">{step.title}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 flex justify-center">
            <Button asChild className="rounded-full shadow-soft hover:shadow-glow">
              <Link href="/custom-order"><Sparkles className="mr-2 h-4 w-4" /> Start Custom Order</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Part 2 — Apply Your Nails */}
      <section className="container mx-auto px-4 py-14 max-w-3xl">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-xs font-bold tracking-[0.2em] text-primary uppercase">Part 2</span>
        </div>
        <div className="flex items-center gap-3 mb-8">
          <div className="h-10 w-10 rounded-full bg-pink-light flex items-center justify-center">
            <Star className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="font-display text-2xl font-semibold">Apply Your Nails</h2>
            <p className="text-sm text-muted-foreground">Once your set arrives — here's how to wear them</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6 items-start">
          <div className="space-y-4">
            {[
              { step: '01', title: 'Prep Your Nails', desc: 'Clean your nails with rubbing alcohol or nail wipes. Remove any oil or moisture — this is the key to a long-lasting hold.' },
              { step: '02', title: 'Find Your Size', desc: 'Lay out the press-ons and match each nail to the correct finger. They should fit snugly from side to side with no overhang.' },
              { step: '03', title: 'Apply the Adhesive', desc: 'Use the included adhesive tabs or nail glue. Place a small amount on your natural nail or on the press-on surface.' },
              { step: '04', title: 'Press & Hold', desc: 'Align the press-on at the cuticle, press firmly down from cuticle to tip, and hold for 10–15 seconds. Repeat for all nails.' },
              { step: '05', title: 'Finishing Touch', desc: 'Avoid water for at least 1 hour after application. Your nails are ready to slay — enjoy for up to 2 weeks with proper care!' },
            ].map((item) => (
              <div key={item.step} className="flex gap-4 p-5 rounded-2xl bg-card border border-border shadow-soft">
                <div className="h-9 w-9 rounded-full bg-pink-light text-primary flex items-center justify-center font-display font-bold text-sm shrink-0">
                  {item.step}
                </div>
                <div>
                  <p className="font-semibold text-sm mb-1">{item.title}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="rounded-2xl overflow-hidden shadow-card sticky top-24">
            <img
              src="https://images.unsplash.com/photo-1604654894610-df63bc536371?w=500&h=560&fit=crop&q=80"
              alt="Applying press-on nails"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        <div className="mt-6 p-5 rounded-2xl bg-pink-light border border-primary/20 flex items-start gap-3">
          <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-sm text-primary mb-1">Pro tip: removal is easy too!</p>
            <p className="text-sm text-primary/70">Soak fingers in warm soapy water for 10 minutes. Gently wiggle the press-on from the sides — never force it. Your nails stay healthy and the press-ons stay reusable.</p>
          </div>
        </div>
      </section>

      {/* Still have questions */}
      <section className="container mx-auto px-4 py-12 max-w-xl text-center space-y-3">
        <h2 className="font-display text-2xl font-semibold">Still have questions?</h2>
        <p className="text-muted-foreground text-sm">Check our FAQs or reach out directly.</p>
        <div className="flex justify-center gap-3 flex-wrap pt-1">
          <Button asChild variant="outline" className="rounded-full">
            <Link href="/faq">Read FAQs</Link>
          </Button>
          <Button asChild variant="outline" className="rounded-full">
            <Link href="/contact">Contact Us</Link>
          </Button>
        </div>
      </section>
    </Layout>
  );
}
