import Link from 'next/link';
import { Sparkles, Star, Heart, Award, Instagram, MessageCircle, ArrowRight } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';

export const metadata = {
  title: 'About Reet | Nail Shingaar by Reet',
  description: 'Meet Reet Rajpal — renowned nail technician, educator, and the artist behind Nail Shingaar.',
};

const stats = [
  { value: '7+',    label: 'Years of Experience' },
  { value: '1000+', label: 'Happy Clients' },
  { value: '100%',  label: 'Handcrafted Sets' },
  { value: '∞',     label: 'Passion for Nails' },
];

const skills = [
  'Classic Manicures',
  'Intricate Nail Art',
  'Acrylic Extensions',
  'Press-On Sets',
  'Custom Designs',
  'Nail Education',
];

export default function AboutPage() {
  return (
    <Layout>
      {/* Hero */}
      <section className="relative overflow-hidden bg-ink-light border-b border-border">
        <div className="container mx-auto px-4 py-16 md:py-24 max-w-5xl">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 bg-pink-light text-primary px-4 py-1.5 rounded-full text-sm font-medium">
                <Sparkles className="h-3.5 w-3.5" /> Meet the Artist
              </div>
              <h1 className="font-display text-4xl md:text-5xl font-semibold leading-tight">
                Hi, I'm <span className="text-primary">Reet Rajpal</span>
              </h1>
              <p className="text-muted-foreground text-lg leading-relaxed">
                The creator behind Nail Shingaar by Reet ✨ — welcome to the ultimate nail experience.
                Handmade press-on nails for every mood &amp; occasion, made with love, detail, and a little bit of shingaar 💅🏻
              </p>
              <div className="flex flex-wrap gap-3 pt-2">
                <Button asChild className="rounded-full shadow-soft hover:shadow-glow">
                  <Link href="/custom-order">
                    <Sparkles className="h-4 w-4 mr-2" /> Order Custom Nails
                  </Link>
                </Button>
                <Button asChild variant="outline" className="rounded-full">
                  <Link href="/shop">
                    Browse Shop <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
              </div>
            </div>

            {/* Photo */}
            <div className="flex justify-center md:justify-end">
              <div className="relative">
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-primary/20 to-pink-light rotate-3 scale-105" />
                <div className="relative w-72 h-80 md:w-80 md:h-96 rounded-3xl overflow-hidden border-4 border-white shadow-card">
                  {/* Replace /reet-photo.jpg with your actual image file name */}
                  <img
                    src="/reet-photo-2.jpg"
                    alt="Reet Rajpal — Nail Artist"
                    className="w-full h-full object-cover object-top"
                  />
                </div>
                <div className="absolute -bottom-4 -left-4 bg-white rounded-2xl shadow-card px-4 py-2.5 flex items-center gap-2 border border-border">
                  <div className="flex -space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <span className="text-xs font-semibold text-foreground">1000+ happy clients</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-b border-border bg-background">
        <div className="container mx-auto px-4 py-10 max-w-5xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((s) => (
              <div key={s.label} className="text-center space-y-1">
                <p className="font-display text-4xl font-bold text-primary">{s.value}</p>
                <p className="text-sm text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bio */}
      <section className="container mx-auto px-4 py-16 max-w-5xl">
        <div className="grid md:grid-cols-2 gap-12 items-start">
          <div className="space-y-5">
            <h2 className="font-display text-3xl font-semibold">My Story</h2>
            <p className="text-muted-foreground leading-relaxed">
              With more than 7 years of experience and a portfolio that showcases my mastery of
              cutting-edge techniques, I&apos;ve established myself as a well known and a
              respectful nail technician in the nail industry.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              I also make handmade press-on nails for every mood &amp; occasion. From soft everyday
              looks to bold glam designs, each set is made with love, detail, and a little bit of
              shingaar 💅🏻
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Thank you for supporting my small business ♡
            </p>
          </div>

          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-card border border-border shadow-soft">
              <div className="flex items-center gap-2 mb-4">
                <Award className="h-5 w-5 text-primary" />
                <h3 className="font-semibold text-base">Expertise</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill) => (
                  <span key={skill}
                    className="text-xs font-medium px-3 py-1.5 bg-pink-light text-primary rounded-full">
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-card border border-primary/30 shadow-soft">
              <div className="flex items-center gap-2 mb-3">
                <Heart className="h-5 w-5 text-primary" />
                <h3 className="font-semibold text-base">The Nail Shingaar Promise</h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Every set is handcrafted with precision and love. Custom-sized to your nails,
                designed to your vision, and delivered to your door — so you can wear art on your hands.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Payment & Contact */}
      <section className="bg-ink-light border-t border-border">
        <div className="container mx-auto px-4 py-16 max-w-5xl">
          <div className="text-center mb-10">
            <h2 className="font-display text-3xl font-semibold mb-2">Get in Touch</h2>
            <p className="text-muted-foreground">Reach out for custom orders, collaborations, or training enquiries.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 items-center max-w-3xl mx-auto">
            {/* QR Code */}
            <div className="flex flex-col items-center gap-4 p-8 rounded-2xl bg-card border border-border shadow-soft">
              <p className="font-semibold text-base">Pay via UPI</p>
              <div className="w-48 h-48 rounded-2xl overflow-hidden border border-border shadow-soft">
                {/* Replace /qr-code.jpg with your actual QR image file name */}
                <img src="/qr-code.jpg" alt="Reet Rajpal UPI QR Code" className="w-full h-full object-cover" />
              </div>
              <div className="text-center space-y-0.5">
                <p className="text-xs text-muted-foreground">UPI ID</p>
                <p className="font-mono font-bold text-primary text-lg">reetrajpal02@okaxis</p>
                <p className="text-xs text-muted-foreground">Scan to pay with any UPI app</p>
              </div>
            </div>

            {/* Social / Contact */}
            <div className="space-y-4">
              <div className="p-5 rounded-2xl bg-card border border-border shadow-soft flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-pink-500 to-orange-400 flex items-center justify-center shrink-0">
                  <Instagram className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-sm">Instagram</p>
                  <a
                    href="https://www.instagram.com/nailshingaar"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline"
                  >
                    @nailshingaar
                  </a>
                </div>
              </div>

              <a
                href="https://wa.me/919569570825"
                target="_blank"
                rel="noopener noreferrer"
                className="p-5 rounded-2xl bg-card border border-border shadow-soft flex items-center gap-4 hover:border-green-300 transition-colors"
              >
                <div className="h-12 w-12 rounded-full bg-green-500 flex items-center justify-center shrink-0">
                  <MessageCircle className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-sm">WhatsApp</p>
                  <p className="text-sm text-primary font-medium">+91 95695 70825</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Reach out for custom orders</p>
                </div>
              </a>

              <Button asChild className="w-full rounded-full shadow-soft hover:shadow-glow" size="lg">
                <Link href="/custom-order">
                  <Sparkles className="h-4 w-4 mr-2" /> Start a Custom Order
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
