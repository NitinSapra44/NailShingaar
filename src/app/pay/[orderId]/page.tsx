'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Upload, X, Loader2, CheckCircle2, Sparkles } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import type { Order } from '@/types';

export default function PayPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [preview, setPreview] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const fileRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!orderId) return;
    supabase.from('orders').select('*').eq('id', orderId).single()
      .then(({ data, error }) => {
        if (error || !data) { router.replace('/orders'); return; }
        const o = data as Order;
        // Guard: only allow access if payment is still pending
        if (o.payment_status !== 'pending') { router.replace('/orders'); return; }
        setOrder(o);
        setLoading(false);
      });
  }, [orderId, router]);

  const handleFile = (file: File | null) => {
    setScreenshot(file);
    setPreview(file ? URL.createObjectURL(file) : '');
  };

  const handleSubmit = async () => {
    if (!screenshot) {
      toast({ title: 'Screenshot required', description: 'Please upload your payment screenshot.', variant: 'destructive' });
      return;
    }
    if (!user || !order) return;
    setSubmitting(true);
    try {
      const ts = Date.now();
      const ext = screenshot.name.split('.').pop();
      const path = `${user.id}/${ts}_payment.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from('payment-screenshots')
        .upload(path, screenshot, { upsert: true });
      if (uploadError) throw new Error(uploadError.message);

      const screenshotUrl = supabase.storage.from('payment-screenshots').getPublicUrl(path).data.publicUrl;

      const { error: updateError } = await supabase
        .from('orders')
        .update({ payment_screenshot: screenshotUrl, payment_status: 'screenshot_uploaded' })
        .eq('id', order.id);
      if (updateError) throw new Error(updateError.message);

      toast({ title: 'Payment screenshot submitted!', description: 'Reet will confirm your payment and start crafting.' });
      router.replace('/orders');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Something went wrong. Please try again.';
      toast({ title: 'Upload failed', description: message, variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!order) return null;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12 max-w-lg">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-pink-light text-primary px-4 py-1.5 rounded-full text-sm font-medium mb-3">
            <Sparkles className="h-3.5 w-3.5" /> Custom Design Order
          </div>
          <h1 className="font-display text-3xl font-semibold mb-2">Complete Your Payment</h1>
          <p className="text-muted-foreground text-sm">
            Reet has reviewed your design and quoted a price — pay to start crafting!
          </p>
        </div>

        {/* Price summary */}
        <div className="p-5 rounded-2xl bg-card border border-primary/30 shadow-soft mb-6 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Custom Design — Press-On Nails</p>
              <p className="font-semibold text-lg mt-0.5">₹{order.total.toFixed(0)}</p>
            </div>
            <CheckCircle2 className="h-8 w-8 text-primary" />
          </div>
          <div className="text-xs text-muted-foreground space-y-0.5 border-t border-border pt-3">
            <p><span className="font-medium text-foreground">Shape:</span> {order.nail_shape} · <span className="font-medium text-foreground">Length:</span> {order.nail_length}</p>
            <p><span className="font-medium text-foreground">Shipping to:</span> {order.shipping_name}, {order.shipping_city}</p>
          </div>
        </div>

        {/* UPI payment box */}
        <div className="p-6 rounded-2xl bg-card border border-border shadow-soft space-y-5 text-center mb-6">
          <p className="font-semibold text-lg">Scan & Pay ₹{order.total.toFixed(0)}</p>

          {/* QR Code */}
          <div className="flex justify-center">
            <div className="p-3 rounded-2xl border-2 border-primary/20 bg-white inline-block shadow-soft">
              <img
                src="/qr-reet.png"
                alt="UPI QR Code — Nail Shingaar by Reet"
                className="w-48 h-48 object-contain rounded-xl"
              />
            </div>
          </div>

          <div className="space-y-1">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Or pay via UPI ID</p>
            <p className="font-mono font-bold text-primary text-base select-all">reetrajpal02@okaxis</p>
            <p className="text-[11px] text-muted-foreground">Tap to copy · Accepted on PhonePe, GPay, Paytm & all UPI apps</p>
          </div>
        </div>

        {/* Screenshot upload */}
        <div className="space-y-3">
          <Label className="text-base font-semibold">Upload Payment Screenshot *</Label>
          <p className="text-sm text-muted-foreground">After paying, take a screenshot of the success screen and upload it here.</p>

          {preview ? (
            <div className="relative rounded-xl overflow-hidden border border-border max-h-72">
              <img src={preview} alt="Payment screenshot" className="w-full object-contain" />
              <button type="button" onClick={() => handleFile(null)}
                className="absolute top-2 right-2 h-7 w-7 rounded-full bg-foreground/70 text-background flex items-center justify-center">
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <button type="button" onClick={() => fileRef.current?.click()}
              className="w-full py-10 rounded-xl border-2 border-dashed border-border bg-muted/40 flex flex-col items-center gap-2 hover:border-primary/50 hover:bg-pink-light/30 transition-colors">
              <Upload className="h-8 w-8 text-muted-foreground" />
              <span className="text-sm font-medium">Click to upload screenshot</span>
              <span className="text-xs text-muted-foreground">JPG, PNG up to 5 MB</span>
            </button>
          )}
          <input ref={fileRef} type="file" accept="image/*" className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0] ?? null)} />
        </div>

        <Button className="w-full mt-6 rounded-full shadow-soft hover:shadow-glow" size="lg"
          onClick={handleSubmit} disabled={submitting || !screenshot}>
          {submitting
            ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Submitting…</>
            : <><CheckCircle2 className="h-4 w-4 mr-2" />Submit Payment</>}
        </Button>
      </div>
    </Layout>
  );
}
