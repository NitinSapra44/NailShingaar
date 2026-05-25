import Link from 'next/link';
import { Ruler, Camera, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';

export const metadata = {
  title: 'Size Guide — Coin Method | Nail Shingaar by Reet',
  description: 'Learn how to measure your nails accurately using the coin method for a perfect-fit press-on set.',
};

const steps = [
  {
    number: '01',
    title: 'Gather what you need',
    description: "You'll need a coin (any standard coin like ₹1 or ₹2), good lighting, and your phone camera. Clean and dry your nails before measuring.",
  },
  {
    number: '02',
    title: 'Place the coin beside your nail',
    description: 'Hold a coin flat against your fingertip, right next to your nail. This gives us a reference scale so we can calculate the exact width of your nail.',
  },
  {
    number: '03',
    title: 'Take a clear photo',
    description: 'Photograph your nail with the coin visible beside it. Keep the camera directly above, not at an angle. Make sure the full nail and the coin are both in frame.',
  },
  {
    number: '04',
    title: 'Repeat for all 10 fingers',
    description: "Take 4 photos in total: left hand 4 fingers, left thumb, right hand 4 fingers, right thumb. You don't need individual finger shots — one photo per group is perfect.",
  },
];

const photos = [
  { label: 'Left Hand — 4 Fingers', hint: 'Index, middle, ring & pinky together' },
  { label: 'Left Thumb', hint: 'Coin placed beside the nail' },
  { label: 'Right Hand — 4 Fingers', hint: 'Index, middle, ring & pinky together' },
  { label: 'Right Thumb', hint: 'Coin placed beside the nail' },
];

const tips = [
  'Use natural light or a bright lamp — avoid shadows across the nail.',
  'Keep your hand flat on a table when photographing.',
  "Don't stretch or press your fingers — relax them naturally.",
  "If your nails are polished, that's fine — we can still measure.",
  "If you're between two sizes, size up slightly for comfort.",
];

export default function SizeGuidePage() {
  return (
    <Layout>
      {/* Hero */}
      <section className="bg-nude-light border-b border-border">
        <div className="container mx-auto px-4 py-14 max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 bg-rose-gold-light text-primary px-4 py-1.5 rounded-full text-sm font-medium mb-4">
            <Ruler className="h-3.5 w-3.5" /> Size Guide
          </div>
          <h1 className="font-display text-4xl font-semibold mb-3">The Coin Method</h1>
          <p className="text-muted-foreground text-lg leading-relaxed">
            Every Nail Shingaar set is custom-fitted to your hands. The coin method is the easiest,
            most accurate way to measure at home — no tape or ruler needed.
          </p>
        </div>
      </section>

      {/* Steps */}
      <section className="container mx-auto px-4 py-14 max-w-3xl">
        <h2 className="font-display text-2xl font-semibold mb-8 text-center">Step-by-Step Guide</h2>
        <div className="space-y-6">
          {steps.map((step) => (
            <div key={step.number} className="flex gap-5 p-6 rounded-2xl bg-card border border-border shadow-soft">
              <div className="h-12 w-12 rounded-full bg-rose-gold-light text-primary flex items-center justify-center font-display font-bold text-lg shrink-0">
                {step.number}
              </div>
              <div>
                <h3 className="font-semibold text-base mb-1">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4 photos needed */}
      <section className="bg-nude-light border-y border-border">
        <div className="container mx-auto px-4 py-14 max-w-3xl">
          <div className="flex items-center gap-2 mb-6">
            <Camera className="h-5 w-5 text-primary" />
            <h2 className="font-display text-2xl font-semibold">4 Photos We Need</h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {photos.map((p, i) => (
              <div key={p.label} className="p-5 rounded-2xl bg-card border border-border shadow-soft flex items-start gap-4">
                <div className="h-9 w-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold text-sm shrink-0">
                  {i + 1}
                </div>
                <div>
                  <p className="font-semibold text-sm">{p.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{p.hint}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="text-sm text-muted-foreground mt-4 text-center">
            Upload these 4 photos when placing your custom order or checking out.
          </p>
        </div>
      </section>

      {/* Tips */}
      <section className="container mx-auto px-4 py-14 max-w-3xl">
        <div className="flex items-center gap-2 mb-6">
          <CheckCircle2 className="h-5 w-5 text-primary" />
          <h2 className="font-display text-2xl font-semibold">Tips for Accuracy</h2>
        </div>
        <ul className="space-y-3">
          {tips.map((tip) => (
            <li key={tip} className="flex items-start gap-3 text-sm text-muted-foreground">
              <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              {tip}
            </li>
          ))}
        </ul>

        {/* Warning */}
        <div className="mt-8 p-5 rounded-2xl bg-orange-50 border border-orange-200 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-orange-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-sm text-orange-800 mb-1">Important</p>
            <p className="text-sm text-orange-700">
              Inaccurate measurements may result in a poor fit. If you&apos;re unsure, Reet will reach out
              via WhatsApp to confirm sizing before crafting begins.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-nude-light border-t border-border">
        <div className="container mx-auto px-4 py-12 max-w-xl text-center space-y-4">
          <h2 className="font-display text-2xl font-semibold">Ready to order?</h2>
          <p className="text-muted-foreground text-sm">Now that you know how to measure, place your custom order and upload your nail photos.</p>
          <div className="flex justify-center gap-3 flex-wrap pt-2">
            <Button asChild className="rounded-full shadow-soft hover:shadow-glow">
              <Link href="/custom-order">Custom Order <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
            <Button asChild variant="outline" className="rounded-full">
              <Link href="/shop">Browse Shop</Link>
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
}
