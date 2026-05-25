import Link from 'next/link';
import { Truck, Clock, Package, MapPin, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';

export const metadata = {
  title: 'Shipping Info | Nail Shingaar by Reet',
  description: 'Shipping timelines, costs, and policies for Nail Shingaar by Reet press-on nail sets.',
};

const shippingOptions = [
  {
    icon: Package,
    title: 'Standard Shipping',
    time: '5–7 working days',
    cost: 'Free above ₹999 · ₹60 below',
    note: 'For all shop orders across India',
  },
  {
    icon: Truck,
    title: 'Custom Order Shipping',
    time: '7–10 working days after payment',
    cost: 'Free above ₹999 · ₹60 below',
    note: 'Crafting time included in timeline',
  },
];

const timeline = [
  { label: 'Order Placed', desc: 'Payment screenshot uploaded and verified by Reet.', day: 'Day 0' },
  { label: 'Crafting Begins', desc: 'Reet starts hand-crafting your nail set to your specs.', day: 'Day 1–2' },
  { label: 'Quality Check', desc: 'Every nail is checked for fit, finish, and durability.', day: 'Day 4–5' },
  { label: 'Packaged & Dispatched', desc: 'Your set is carefully packaged and handed to the courier.', day: 'Day 5–7' },
  { label: 'Delivered to You', desc: 'Arrives at your door. Tracking number shared via WhatsApp.', day: 'Day 7–10' },
];

const policies = [
  {
    title: 'Domestic Shipping',
    body: 'We ship across India through trusted courier partners. Most metro cities receive orders within 5–7 working days. Remote areas or Tier-3 cities may take 7–10 working days.',
  },
  {
    title: 'International Shipping',
    body: 'International shipping is available on request. Please contact us before placing your order so we can arrange a shipping quote and timeline.',
  },
  {
    title: 'Tracking Your Order',
    body: "Once your order is dispatched, a tracking number will appear on your Orders page. You'll also receive a WhatsApp message from Reet with the courier name and tracking link.",
  },
  {
    title: 'Damaged in Transit',
    body: "In the rare case your nails arrive damaged, photograph the package and contact us within 24 hours of delivery. We'll arrange a replacement or refund at no cost.",
  },
  {
    title: 'Wrong Address',
    body: 'Please double-check your shipping address before submitting your order. If you notice an error, contact us immediately. We cannot reroute a package once it has been dispatched.',
  },
];

export default function ShippingPage() {
  return (
    <Layout>
      {/* Hero */}
      <section className="bg-nude-light border-b border-border">
        <div className="container mx-auto px-4 py-14 max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 bg-rose-gold-light text-primary px-4 py-1.5 rounded-full text-sm font-medium mb-4">
            <Truck className="h-3.5 w-3.5" /> Shipping Info
          </div>
          <h1 className="font-display text-4xl font-semibold mb-3">Shipping & Delivery</h1>
          <p className="text-muted-foreground text-lg leading-relaxed">
            Every Nail Shingaar set is lovingly packaged and shipped across India.
            Here's everything you need to know about delivery.
          </p>
        </div>
      </section>

      {/* Shipping Options */}
      <section className="container mx-auto px-4 py-14 max-w-3xl">
        <h2 className="font-display text-2xl font-semibold mb-6">Shipping Options</h2>
        <div className="grid sm:grid-cols-2 gap-5">
          {shippingOptions.map((opt) => {
            const Icon = opt.icon;
            return (
              <div key={opt.title} className="p-6 rounded-2xl bg-card border border-border shadow-soft space-y-3">
                <div className="h-10 w-10 rounded-full bg-rose-gold-light flex items-center justify-center">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold text-base">{opt.title}</h3>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="font-medium">{opt.time}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                    <span>{opt.cost}</span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">{opt.note}</p>
              </div>
            );
          })}
        </div>

        {/* Free shipping banner */}
        <div className="mt-6 p-4 rounded-2xl bg-rose-gold-light border border-primary/20 flex items-center gap-3">
          <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
          <p className="text-sm font-medium text-primary">Free shipping on all orders above ₹999!</p>
        </div>
      </section>

      {/* Timeline */}
      <section className="bg-nude-light border-y border-border">
        <div className="container mx-auto px-4 py-14 max-w-3xl">
          <h2 className="font-display text-2xl font-semibold mb-8">Order Timeline</h2>
          <div className="space-y-1">
            {timeline.map((step, i) => (
              <div key={step.label} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="h-9 w-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0">
                    <span className="text-[10px] font-bold">{i + 1}</span>
                  </div>
                  {i < timeline.length - 1 && <div className="w-0.5 flex-1 min-h-[28px] bg-primary/20 my-1" />}
                </div>
                <div className="pb-5">
                  <div className="flex items-center gap-3 mb-1">
                    <p className="font-semibold text-sm">{step.label}</p>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-gold-light text-primary">{step.day}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Policies */}
      <section className="container mx-auto px-4 py-14 max-w-3xl">
        <h2 className="font-display text-2xl font-semibold mb-6">Shipping Policies</h2>
        <div className="space-y-4">
          {policies.map((p) => (
            <div key={p.title} className="p-5 rounded-2xl bg-card border border-border shadow-soft">
              <p className="font-semibold text-sm mb-2">{p.title}</p>
              <p className="text-sm text-muted-foreground leading-relaxed">{p.body}</p>
            </div>
          ))}
        </div>

        {/* Note */}
        <div className="mt-6 p-5 rounded-2xl bg-orange-50 border border-orange-200 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-orange-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-sm text-orange-800 mb-1">Please Note</p>
            <p className="text-sm text-orange-700">
              Delivery timelines are estimates and may vary due to courier delays, public holidays,
              or high-demand periods (festive seasons). Reet will keep you updated via WhatsApp if
              there are any delays.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-nude-light border-t border-border">
        <div className="container mx-auto px-4 py-12 max-w-xl text-center space-y-4">
          <h2 className="font-display text-2xl font-semibold">Have shipping questions?</h2>
          <p className="text-muted-foreground text-sm">We're here to help — reach out any time.</p>
          <Button asChild className="rounded-full shadow-soft hover:shadow-glow">
            <Link href="/contact">Contact Us <ArrowRight className="ml-2 h-4 w-4" /></Link>
          </Button>
        </div>
      </section>
    </Layout>
  );
}
