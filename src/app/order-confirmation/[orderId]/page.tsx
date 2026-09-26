'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, Package, Clock, Loader2, Home, Sparkles, MessageCircle } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import type { Order } from '@/types';

const STATUS_STEPS: { key: Order['status']; label: string; desc: string }[] = [
  { key: 'pending',   label: 'Order Placed', desc: 'Waiting for payment verification' },
  { key: 'confirmed', label: 'Confirmed',    desc: 'Payment verified, crafting your nails' },
  { key: 'shipped',   label: 'Shipped',      desc: 'Your nails are on their way' },
  { key: 'delivered', label: 'Delivered',    desc: 'Enjoy your beautiful nails!' },
];
const ENQUIRY_STEPS = [
  { label: 'Enquiry Received',  desc: 'We have your design & sizing details' },
  { label: 'Price Quoted',      desc: 'Reet will contact you with a personalised quote' },
  { label: 'Confirmed & Crafting', desc: 'Payment confirmed, your nails are being made' },
  { label: 'Shipped',           desc: 'Your nails are on their way' },
  { label: 'Delivered',         desc: 'Enjoy your beautiful nails!' },
];
const STATUS_INDEX: Record<Order['status'], number> = {
  pending: 0, confirmed: 1, shipped: 2, delivered: 3, cancelled: -1,
};
const ENQUIRY_STATUS_INDEX: Record<Order['status'], number> = {
  pending: 0, confirmed: 2, shipped: 3, delivered: 4, cancelled: -1,
};

export default function OrderConfirmationPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) return;
    supabase.from('orders').select('*').eq('id', orderId).single()
      .then(({ data, error }) => { if (!error) setOrder(data as Order); setLoading(false); });

    const channel = supabase.channel(`order-${orderId}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'orders', filter: `id=eq.${orderId}` },
        (payload) => setOrder(payload.new as Order))
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [orderId]);

  if (loading) {
    return <Layout><div className="min-h-[60vh] flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div></Layout>;
  }
  if (!order) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-24 text-center">
          <p className="text-muted-foreground">Order not found.</p>
          <Button asChild className="mt-6 rounded-full"><Link href="/">Go Home</Link></Button>
        </div>
      </Layout>
    );
  }

  const isCustomEnquiry = (() => {
    try { return JSON.parse(order.notes ?? '{}').type === 'custom_design'; } catch { return false; }
  })();

  const currentStep = isCustomEnquiry
    ? ENQUIRY_STATUS_INDEX[order.status]
    : STATUS_INDEX[order.status];
  const steps = isCustomEnquiry ? ENQUIRY_STEPS : STATUS_STEPS;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12 max-w-2xl">
        <div className="text-center space-y-3 mb-10">
          <div className="flex justify-center">
            <div className="h-20 w-20 rounded-full bg-pink-light flex items-center justify-center shadow-card">
              {isCustomEnquiry
                ? <Sparkles className="h-10 w-10 text-primary" />
                : <CheckCircle2 className="h-10 w-10 text-primary" />}
            </div>
          </div>
          <h1 className="font-display text-3xl font-semibold">
            {isCustomEnquiry ? 'Enquiry Received!' : 'Order Placed!'}
          </h1>
          <p className="text-muted-foreground">
            Thank you, <span className="font-medium text-foreground">{order.shipping_name}</span>!{' '}
            {isCustomEnquiry
              ? 'Reet will review your design and get in touch with a personalised price quote.'
              : 'Your order is being reviewed.'}
          </p>
          <p className="text-xs text-muted-foreground font-mono bg-muted px-4 py-2 rounded-full inline-block">
            {isCustomEnquiry ? 'Enquiry' : 'Order'} ID: {order.id.slice(0, 8).toUpperCase()}
          </p>
        </div>

        {isCustomEnquiry && (
          <div className="flex items-start gap-3 p-4 rounded-2xl bg-pink-light border border-primary/20 mb-8">
            <MessageCircle className="h-5 w-5 text-primary mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold text-sm">What happens next?</p>
              <p className="text-xs text-muted-foreground mt-0.5">Reet will review your design photos and contact you on <span className="font-medium text-foreground">{order.shipping_phone}</span> via WhatsApp or call with a price quote within 24 hours.</p>
            </div>
          </div>
        )}

        {!isCustomEnquiry && order.payment_status === 'screenshot_uploaded' && (
          <div className="flex items-start gap-3 p-4 rounded-2xl bg-pink-light border border-accent mb-8">
            <Clock className="h-5 w-5 text-accent-foreground mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold text-sm">Payment screenshot received</p>
              <p className="text-xs text-muted-foreground mt-0.5">We are verifying your payment. Your order will be confirmed within a few hours.</p>
            </div>
          </div>
        )}

        <div className="p-6 rounded-2xl bg-card border border-border shadow-soft mb-6">
          <h2 className="font-display text-lg font-semibold mb-6 flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" /> {isCustomEnquiry ? 'Enquiry Status' : 'Order Status'}
          </h2>
          <div className="space-y-0">
            {steps.map((s, i) => {
              const done = i <= currentStep;
              const active = i === currentStep;
              return (
                <div key={i} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-semibold shrink-0 transition-colors ${done ? (active ? 'bg-primary text-primary-foreground shadow-glow' : 'bg-accent text-accent-foreground') : 'bg-muted text-muted-foreground'}`}>
                      {done && !active ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
                    </div>
                    {i < steps.length - 1 && <div className={`w-0.5 h-10 my-1 rounded-full ${i < currentStep ? 'bg-accent' : 'bg-border'}`} />}
                  </div>
                  <div className="pb-8">
                    <p className={`font-semibold text-sm ${done ? 'text-foreground' : 'text-muted-foreground'}`}>{s.label}</p>
                    <p className="text-xs text-muted-foreground">{s.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-card border border-border shadow-soft mb-8">
          <h2 className="font-display text-lg font-semibold mb-4">{isCustomEnquiry ? 'Enquiry Details' : 'Order Details'}</h2>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-muted-foreground text-xs">Shipping to</p>
              <p className="font-medium">{order.shipping_name}</p>
              <p className="text-muted-foreground">{order.shipping_address}</p>
              <p className="text-muted-foreground">{order.shipping_city}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Nail Specs</p>
              <p className="font-medium">{order.nail_length} length · {order.nail_shape}</p>
              {order.color_preference && <p className="text-muted-foreground">{order.color_preference}</p>}
            </div>
            <div className="col-span-2 border-t border-border pt-3 flex justify-between font-semibold">
              <span>{isCustomEnquiry ? 'Price' : 'Order Total'}</span>
              <span>{isCustomEnquiry ? 'To be confirmed' : `₹${order.total.toFixed(0)}`}</span>
            </div>
          </div>
        </div>

        <Button asChild className="w-full rounded-full shadow-soft">
          <Link href="/shop"><Home className="h-4 w-4 mr-2" />Continue Shopping</Link>
        </Button>
      </div>
    </Layout>
  );
}
