'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { PageHeader, Section, Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui-kit';
import { Button } from '@/components/ui/button';

const faqs = [
  {
    category: 'Press-On Nails',
    items: [
      {
        q: 'Are press-on nails reusable?',
        a: 'Yes! With proper removal and care, our press-on nails can be worn 2–3 times. Always remove them gently using warm water soak or a cuticle pusher — never peel them off forcefully.',
      },
      {
        q: 'How long do press-on nails last?',
        a: 'With nail glue, they typically last 1–2 weeks depending on how you use your hands. For a shorter event, you can use nail tabs which last 1–2 days but make removal easier.',
      },
      {
        q: 'Do press-on nails damage natural nails?',
        a: 'When applied and removed correctly, press-on nails do not damage your nails. Avoid soaking in water for long periods and always follow the proper removal process.',
      },
      {
        q: 'What nail shapes do you offer?',
        a: 'We offer Square, Squoval, Round, Oval, Almond, and Coffin shapes. If you have a specific shape in mind for a custom order, just let us know in your style notes.',
      },
    ],
  },
  {
    category: 'Sizing & Fit',
    items: [
      {
        q: 'How do I know which size to order?',
        a: 'We use the coin method — place a coin beside your nail and photograph it. Upload 4 photos (left 4 fingers, left thumb, right 4 fingers, right thumb) when ordering. Reet measures from your photos to hand-file each nail to your exact width.',
      },
      {
        q: "What if a nail doesn't fit properly?",
        a: "Each set includes a few extra nails in slightly different sizes. If you're concerned about fit, contact us before applying and we'll help. Custom orders always go through a sizing confirmation with Reet before crafting begins.",
      },
      {
        q: 'Can I get a size guide?',
        a: 'Absolutely — visit our Size Guide page for a detailed step-by-step walkthrough of the coin method with photos.',
      },
    ],
  },
  {
    category: 'Custom Orders',
    items: [
      {
        q: 'How does a custom order work?',
        a: 'Go to the Custom Order page, upload your design inspiration (photos, screenshots, anything), choose your shape and length, fill in your contact details, and submit. Reet will review your design and get in touch to discuss pricing and confirm the details.',
      },
      {
        q: 'How long does a custom set take?',
        a: 'Custom sets take 7–10 working days after payment confirmation. Complex designs may take slightly longer. Reet will give you a specific timeline after reviewing your design.',
      },
      {
        q: 'How is the price for a custom order decided?',
        a: 'Pricing depends on the complexity of the design, the number of embellishments, nail length, and materials used. Reet will provide a personalised quote after reviewing your design — no commitment needed before you receive the quote.',
      },
      {
        q: 'Can I make changes after submitting a custom order?',
        a: "Yes, as long as crafting hasn't started. Reet will contact you to discuss the design and you can request changes at that stage. Once crafting begins, major changes may not be possible.",
      },
    ],
  },
  {
    category: 'Payment',
    items: [
      {
        q: 'How do I pay?',
        a: 'We accept UPI payments. After checkout, scan our QR code or pay to reetrajpal02@okaxis on any UPI app (Google Pay, PhonePe, Paytm, etc.). Upload a screenshot of the payment confirmation to complete your order.',
      },
      {
        q: 'When do I pay for a custom order?',
        a: 'There is no payment upfront for custom orders. Once Reet reviews your design and quotes a price, a "Pay Now" button appears in your Orders page. You pay only after agreeing to the quoted price.',
      },
      {
        q: "What if my payment screenshot isn't verified?",
        a: "Reet manually verifies every payment screenshot. If there's an issue, she'll reach out to you directly via WhatsApp or phone. If you don't hear back within 24 hours, contact us.",
      },
    ],
  },
  {
    category: 'Shipping & Delivery',
    items: [
      {
        q: 'Where do you ship?',
        a: 'We ship across India. For international shipping, please contact us directly.',
      },
      {
        q: 'How long does delivery take?',
        a: 'Regular orders: 5–7 working days. Custom orders: 7–10 working days after payment confirmation. Delivery to remote areas may take slightly longer.',
      },
      {
        q: 'Is shipping free?',
        a: 'Shipping is free on orders above ₹999. A small shipping charge applies to orders below that.',
      },
      {
        q: 'Will I get a tracking number?',
        a: "Yes! Once your order is shipped, the tracking number will appear in your Orders page. You'll also receive a WhatsApp message from Reet.",
      },
    ],
  },
];

export default function FAQPage() {
  return (
    <Layout>
      <PageHeader
        eyebrow="Help Centre"
        title="Frequently Asked Questions"
        subtitle="Everything you need to know about our press-on nails, sizing, ordering, and more."
      />

      <Section containerClassName="max-w-3xl space-y-12">
        {faqs.map((section) => (
          <div key={section.category}>
            <h2 className="type-h3 mb-2 border-b border-gold/40 pb-3 text-foreground">{section.category}</h2>
            <Accordion type="single" collapsible>
              {section.items.map((item) => (
                <AccordionItem key={item.q} value={item.q}>
                  <AccordionTrigger className="font-sans text-base font-semibold">{item.q}</AccordionTrigger>
                  <AccordionContent>{item.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        ))}
      </Section>

      <Section tone="soft" containerClassName="max-w-xl text-center">
        <h2 className="type-h2 text-foreground">Didn&apos;t find your answer?</h2>
        <p className="mt-3 text-muted-foreground">Reach out to Reet directly — she replies personally to every message.</p>
        <Button asChild className="mt-6">
          <Link href="/contact">Contact Us <ArrowRight aria-hidden /></Link>
        </Button>
      </Section>
    </Layout>
  );
}
