'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Check, ChevronRight, Upload, X, Camera, Loader2, Info } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { NailQuestionnaire, ShippingDetails, Product } from '@/types';

const NAIL_SHAPES: { id: NailQuestionnaire['nail_shape']; label: string; desc: string; image: string }[] = [
  { id: 'Square',  label: 'Square',  desc: 'Straight sides & flat top',    image: '/nail-shapes/nail-square.jpg' },
  { id: 'Round',   label: 'Round',   desc: 'Curved tip, natural feel',      image: '/nail-shapes/nail-squoval.jpg' },
  { id: 'Squoval', label: 'Squoval', desc: 'Square with soft corners',      image: '/nail-shapes/nail-round.jpg' },
  { id: 'Oval',    label: 'Oval',    desc: 'Elegant tapered oval',          image: '/nail-shapes/nail-oval.jpg' },
  { id: 'Almond',  label: 'Almond',  desc: 'Pointed tip, slender sides',    image: '/nail-shapes/nail-almond.jpg' },
  { id: 'Coffin',  label: 'Coffin',  desc: 'Tapered sides, flat top',       image: '/nail-shapes/nail-coffin.jpg' },
];
const NAIL_LENGTHS: NailQuestionnaire['nail_length'][] = ['Small', 'Medium', 'Long'];
const REQUIRED_SLOTS = [
  { key: 'left_fingers',  label: 'Left Hand — 4 Fingers', hint: 'Index, middle, ring & pinky' },
  { key: 'left_thumb',    label: 'Left Thumb',            hint: 'Place a coin beside nail for scale' },
  { key: 'right_fingers', label: 'Right Hand — 4 Fingers',hint: 'Index, middle, ring & pinky' },
  { key: 'right_thumb',   label: 'Right Thumb',           hint: 'Place a coin beside nail for scale' },
  { key: 'full_hand',     label: 'Full Hand Overview',    hint: 'Relaxed shot of your whole hand, no coin needed' },
];
const STEPS = ['Nail Sizing', 'Shipping', 'Payment'];

function StepBar({ current }: Readonly<{ current: number }>) {
  return (
    <div className="flex items-center gap-0 mb-10">
      {STEPS.map((label, i) => {
        let stepCls = 'bg-muted text-muted-foreground';
        if (i < current) stepCls = 'bg-accent text-accent-foreground';
        if (i === current) stepCls = 'bg-primary text-primary-foreground shadow-glow';
        return (
          <div key={label} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center">
              <div className={`h-9 w-9 rounded-full flex items-center justify-center font-semibold text-sm transition-colors ${stepCls}`}>
                {i < current ? <Check className="h-4 w-4" /> : i + 1}
              </div>
              <span className="text-xs mt-1.5 font-medium text-muted-foreground hidden sm:block">{label}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`flex-1 h-0.5 mx-2 rounded-full transition-colors ${i < current ? 'bg-accent' : 'bg-border'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function CheckoutPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const [product, setProduct] = useState<Product | null>(null);
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { router.replace('/auth?redirect=/checkout'); return; }
    const stored = sessionStorage.getItem('checkout_product');
    if (stored) {
      setProduct(JSON.parse(stored));
    } else {
      router.replace('/shop');
    }
  }, [router, user, authLoading]);

  const [questionnaire, setQuestionnaire] = useState<Omit<NailQuestionnaire, 'nail_photos'>>({
    nail_length: 'Medium', nail_shape: 'Oval', color_preference: '',
  });
  const [nailPhotos, setNailPhotos] = useState<Record<string, File | null>>({
    left_fingers: null, left_thumb: null, right_fingers: null, right_thumb: null, full_hand: null,
  });
  const [photoPreviews, setPhotoPreviews] = useState<Record<string, string>>({});
  const photoRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const [extraPhotos, setExtraPhotos] = useState<File[]>([]);
  const [extraPreviews, setExtraPreviews] = useState<string[]>([]);
  const extraPhotoRef = useRef<HTMLInputElement | null>(null);
  const [shipping, setShipping] = useState<ShippingDetails>({ full_name: '', phone: '', address: '', city: '', pincode: '' });
  const [paymentScreenshot, setPaymentScreenshot] = useState<File | null>(null);
  const [paymentPreview, setPaymentPreview] = useState('');
  const paymentRef = useRef<HTMLInputElement | null>(null);

  const shippingCost = (product?.price ?? 0) >= 999 ? 0 : 99;
  const orderTotal = (product?.price ?? 0) + shippingCost;

  const handlePhotoChange = (key: string, file: File | null) => {
    setNailPhotos((prev) => ({ ...prev, [key]: file }));
    if (file) setPhotoPreviews((prev) => ({ ...prev, [key]: URL.createObjectURL(file) }));
    else setPhotoPreviews((prev) => { const n = { ...prev }; delete n[key]; return n; });
  };

  const handleExtraPhoto = (file: File | null) => {
    if (!file) return;
    setExtraPhotos((prev) => [...prev, file]);
    setExtraPreviews((prev) => [...prev, URL.createObjectURL(file)]);
  };

  const removeExtraPhoto = (i: number) => {
    setExtraPhotos((prev) => prev.filter((_, idx) => idx !== i));
    setExtraPreviews((prev) => prev.filter((_, idx) => idx !== i));
  };

  const handlePaymentScreenshot = (file: File | null) => {
    setPaymentScreenshot(file);
    setPaymentPreview(file ? URL.createObjectURL(file) : '');
  };

  const validateQuestionnaire = () => {
    const uploaded = Object.values(nailPhotos).filter(Boolean);
    if (uploaded.length < REQUIRED_SLOTS.length) {
      toast({ title: 'Photos required', description: `Please upload all ${REQUIRED_SLOTS.length} nail photos.`, variant: 'destructive' });
      return false;
    }
    return true;
  };

  const validateShipping = () => {
    const { full_name, phone, address, city, pincode } = shipping;
    if (!full_name.trim() || !phone.trim() || !address.trim() || !city.trim() || !pincode.trim()) {
      toast({ title: 'Incomplete details', description: 'Please fill in all shipping fields.', variant: 'destructive' });
      return false;
    }
    if (!/^\d{10}$/.test(phone.replace(/\s/g, ''))) {
      toast({ title: 'Invalid phone', description: 'Please enter a valid 10-digit phone number.', variant: 'destructive' });
      return false;
    }
    return true;
  };

  const compressImage = (file: File, maxPx = 1200, quality = 0.75): Promise<File> =>
    new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, maxPx / Math.max(img.width, img.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((blob) => {
          resolve(blob ? new File([blob], file.name.replace(/\.\w+$/, '.jpg'), { type: 'image/jpeg' }) : file);
        }, 'image/jpeg', quality);
      };
      img.onerror = () => resolve(file);
      img.src = URL.createObjectURL(file);
    });

  const uploadFile = async (bucket: string, file: File, path: string): Promise<string> => {
    const compressed = file.type.startsWith('image/') ? await compressImage(file) : file;
    const finalPath = path.replace(/\.\w+$/, '.jpg');
    const { error } = await supabase.storage.from(bucket).upload(finalPath, compressed, { upsert: true, contentType: 'image/jpeg' });
    if (error) throw new Error(error.message);
    return supabase.storage.from(bucket).getPublicUrl(finalPath).data.publicUrl;
  };

  const handleSubmitOrder = async () => {
    if (!paymentScreenshot) {
      toast({ title: 'Screenshot required', description: 'Please upload your payment screenshot.', variant: 'destructive' });
      return;
    }
    if (!user) { router.push('/auth?redirect=/checkout'); return; }
    if (!product) return;
    setSubmitting(true);
    try {
      const ts = Date.now();
      const photoUrls: string[] = [];
      for (const slot of REQUIRED_SLOTS) {
        const file = nailPhotos[slot.key];
        if (file) photoUrls.push(await uploadFile('nail-photos', file, `${user.id}/${ts}_${slot.key}.${file.name.split('.').pop()}`));
      }
      for (let i = 0; i < extraPhotos.length; i++) {
        const file = extraPhotos[i];
        photoUrls.push(await uploadFile('nail-photos', file, `${user.id}/${ts}_extra_${i}.${file.name.split('.').pop()}`));
      }
      const screenshotUrl = await uploadFile('payment-screenshots', paymentScreenshot, `${user.id}/${ts}_payment.${paymentScreenshot.name.split('.').pop()}`);

      const { data: order, error: orderError } = await supabase.from('orders').insert({
        user_id: user.id, status: 'pending', total: orderTotal,
        shipping_name: shipping.full_name, shipping_phone: shipping.phone,
        shipping_address: `${shipping.address}, ${shipping.pincode}`, shipping_city: shipping.city,
        nail_length: questionnaire.nail_length, nail_shape: questionnaire.nail_shape,
        color_preference: questionnaire.color_preference || null,
        nail_photos: photoUrls, payment_screenshot: screenshotUrl, payment_status: 'screenshot_uploaded',
      }).select().single();

      if (orderError) throw new Error(orderError.message);

      await supabase.from('order_items').insert({
        order_id: order.id, product_id: product.id, product_name: product.name,
        product_image: product.image_url, size: questionnaire.nail_shape, quantity: 1, price: product.price,
      });

      sessionStorage.removeItem('checkout_product');
      router.push(`/order-confirmation/${order.id}`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to place order. Please try again.';
      toast({ title: 'Order failed', description: message, variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  if (!product) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-32 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-10 max-w-4xl">
        <h1 className="font-display text-3xl font-semibold mb-2 text-center">Complete Your Order</h1>
        <p className="text-center text-muted-foreground mb-8 text-sm">We need a few details to custom-make this set perfectly for you</p>
        <StepBar current={step} />

        <div className="grid lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2">
            {step === 0 && (
              <div className="space-y-8 animate-fade-up">
                <h2 className="font-display text-xl font-semibold">Nail Sizing & Preferences</h2>

                <div className="space-y-3">
                  <Label className="text-base font-semibold">1. Required Length</Label>
                  <div className="flex gap-3 flex-wrap">
                    {NAIL_LENGTHS.map((len) => (
                      <button key={len} type="button" onClick={() => setQuestionnaire({ ...questionnaire, nail_length: len })}
                        className={`flex-1 min-w-[90px] py-3 px-4 rounded-xl border-2 font-medium text-sm transition-all ${questionnaire.nail_length === len ? 'border-primary bg-pink-light text-primary shadow-soft' : 'border-border bg-card hover:border-primary/40'}`}>
                        {len}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-base font-semibold">2. Required Shape</Label>
                  <div className="grid grid-cols-3 gap-3">
                    {NAIL_SHAPES.map((shape) => (
                      <button key={shape.id} type="button" onClick={() => setQuestionnaire({ ...questionnaire, nail_shape: shape.id })}
                        className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${questionnaire.nail_shape === shape.id ? 'border-primary bg-pink-light shadow-soft' : 'border-border bg-card hover:border-primary/40'}`}>
                        <img src={shape.image} alt={shape.label}
                          className="w-12 h-14 object-cover rounded-lg" />
                        <div className="text-center">
                          <p className="text-xs font-semibold leading-tight">{shape.label}</p>
                          <p className="text-[10px] text-muted-foreground leading-tight">{shape.desc}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-base font-semibold">3. Colour Preference <span className="font-normal text-muted-foreground">(optional)</span></Label>
                  <Textarea placeholder="e.g. Nude with gold glitter, deep burgundy, pastel pink French tips…"
                    value={questionnaire.color_preference}
                    onChange={(e) => setQuestionnaire({ ...questionnaire, color_preference: e.target.value })}
                    className="rounded-xl resize-none" rows={2} />
                </div>

                <div className="space-y-3">
                  <Label className="text-base font-semibold">4. Nail Size Photos</Label>
                  <div className="flex items-start gap-2 px-4 py-3 bg-ink-light rounded-xl border border-border text-sm">
                    <Info className="h-4 w-4 mt-0.5 shrink-0 text-primary" />
                    <div>
                      <p className="font-medium text-foreground">Coin Method</p>
                      <p className="text-muted-foreground text-xs mt-0.5">Place a ₹5 or ₹10 coin flat beside your nails in each photo. Lay your hand flat, ensure good lighting, and capture all fingers clearly.</p>
                    </div>
                  </div>
                  <img
                    src="/Reference-Pic.jpeg"
                    alt="Coin method reference — place an Indian coin beside your fingers and thumb, photographed directly from above with fingers closed"
                    className="w-full max-w-sm mx-auto rounded-xl border border-border"
                  />
                  <div className="grid grid-cols-2 gap-4">
                    {REQUIRED_SLOTS.map((slot) => (
                      <div key={slot.key} className={slot.key === 'full_hand' ? 'col-span-2' : undefined}>
                        <p className="text-xs font-semibold mb-0.5">{slot.label}</p>
                        <p className="text-xs text-muted-foreground mb-2">{slot.hint}</p>
                        {slot.key === 'full_hand' && (
                          <img
                            src="/Img5.jpeg"
                            alt="Full hand overview reference — a relaxed, natural shot of the whole hand"
                            className="w-full max-w-sm mx-auto rounded-xl border border-border mb-2"
                          />
                        )}
                        {photoPreviews[slot.key] ? (
                          <div className={`relative rounded-xl overflow-hidden border border-border ${slot.key === 'full_hand' ? 'aspect-video max-w-sm mx-auto' : 'aspect-square'}`}>
                            <img src={photoPreviews[slot.key]} alt={slot.label} className="w-full h-full object-cover" />
                            <button type="button" onClick={() => handlePhotoChange(slot.key, null)}
                              className="absolute top-1.5 right-1.5 h-6 w-6 rounded-full bg-foreground/70 text-background flex items-center justify-center">
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ) : (
                          <button type="button" onClick={() => photoRefs.current[slot.key]?.click()}
                            className={`w-full rounded-xl border-2 border-dashed border-border bg-muted/40 flex flex-col items-center justify-center gap-1 hover:border-primary/50 hover:bg-pink-light/30 transition-colors ${slot.key === 'full_hand' ? 'aspect-video max-w-sm mx-auto' : 'aspect-square'}`}>
                            <Camera className="h-6 w-6 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">Upload photo</span>
                          </button>
                        )}
                        <input ref={(el) => { photoRefs.current[slot.key] = el; }}
                          type="file" accept="image/*" className="hidden"
                          onChange={(e) => handlePhotoChange(slot.key, e.target.files?.[0] ?? null)} />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-semibold">Additional Photos <span className="font-normal text-muted-foreground">(optional)</span></p>
                  <div className="flex flex-wrap gap-2">
                    {extraPreviews.map((src, i) => (
                      <div key={src} className="relative w-20 h-20">
                        <img src={src} alt="extra" className="w-full h-full rounded-xl object-cover border border-border" />
                        <button type="button" onClick={() => removeExtraPhoto(i)}
                          className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-foreground/70 text-background flex items-center justify-center">
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                    <button type="button" onClick={() => extraPhotoRef.current?.click()}
                      className="w-20 h-20 rounded-xl border-2 border-dashed border-border bg-muted/40 flex flex-col items-center justify-center gap-1 hover:border-primary/50 hover:bg-pink-light/30 transition-colors">
                      <Camera className="h-5 w-5 text-muted-foreground" />
                      <span className="text-[10px] text-muted-foreground">Add more</span>
                    </button>
                  </div>
                  <input ref={extraPhotoRef} type="file" accept="image/*" className="hidden"
                    onChange={(e) => { handleExtraPhoto(e.target.files?.[0] ?? null); e.target.value = ''; }} />
                </div>

                <Button className="w-full rounded-full shadow-soft hover:shadow-glow" size="lg"
                  onClick={() => { if (validateQuestionnaire()) setStep(1); }}>
                  Continue to Shipping <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-6 animate-fade-up">
                <h2 className="font-display text-xl font-semibold">Shipping Details</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 space-y-1.5">
                    <Label>Full Name</Label>
                    <Input placeholder="Your full name" value={shipping.full_name}
                      onChange={(e) => setShipping({ ...shipping, full_name: e.target.value })} className="rounded-xl" />
                  </div>
                  <div className="col-span-2 space-y-1.5">
                    <Label>Phone Number</Label>
                    <Input type="tel" placeholder="10-digit mobile number" value={shipping.phone}
                      onChange={(e) => setShipping({ ...shipping, phone: e.target.value })} className="rounded-xl" />
                  </div>
                  <div className="col-span-2 space-y-1.5">
                    <Label>Address</Label>
                    <Textarea placeholder="Flat / House no., Street, Area" value={shipping.address}
                      onChange={(e) => setShipping({ ...shipping, address: e.target.value })} className="rounded-xl resize-none" rows={2} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>City</Label>
                    <Input placeholder="Mumbai" value={shipping.city}
                      onChange={(e) => setShipping({ ...shipping, city: e.target.value })} className="rounded-xl" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Pincode</Label>
                    <Input placeholder="400001" value={shipping.pincode}
                      onChange={(e) => setShipping({ ...shipping, pincode: e.target.value })} className="rounded-xl" />
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1 rounded-full" onClick={() => setStep(0)}>Back</Button>
                  <Button className="flex-1 rounded-full shadow-soft hover:shadow-glow" size="lg"
                    onClick={() => { if (validateShipping()) setStep(2); }}>
                    Continue to Payment <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6 animate-fade-up">
                <h2 className="font-display text-xl font-semibold">Payment</h2>
                <div className="p-6 rounded-2xl bg-card border border-border shadow-soft space-y-4 text-center">
                  <p className="font-semibold text-lg">Scan & Pay ₹{orderTotal.toFixed(0)}</p>
                  <div className="flex justify-center">
                    <div className="p-3 rounded-2xl border-2 border-primary/20 bg-white inline-block shadow-soft">
                      <img
                        src="/qr-code.jpg"
                        alt="UPI QR Code — Nail Shingaar by Reet"
                        className="w-48 h-48 object-contain rounded-xl"
                      />
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">Scan with PhonePe, GPay, Paytm or any UPI app</p>
                </div>

                <div className="space-y-3">
                  <Label className="text-base font-semibold">Upload Payment Screenshot *</Label>
                  <p className="text-sm text-muted-foreground">After paying, take a screenshot and upload it here.</p>
                  {paymentPreview ? (
                    <div className="relative rounded-xl overflow-hidden border border-border max-h-64">
                      <img src={paymentPreview} alt="Payment screenshot" className="w-full object-contain" />
                      <button type="button" onClick={() => handlePaymentScreenshot(null)}
                        className="absolute top-2 right-2 h-7 w-7 rounded-full bg-foreground/70 text-background flex items-center justify-center">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <button type="button" onClick={() => paymentRef.current?.click()}
                      className="w-full py-10 rounded-xl border-2 border-dashed border-border bg-muted/40 flex flex-col items-center gap-2 hover:border-primary/50 hover:bg-pink-light/30 transition-colors">
                      <Upload className="h-8 w-8 text-muted-foreground" />
                      <span className="text-sm font-medium">Click to upload screenshot</span>
                      <span className="text-xs text-muted-foreground">JPG, PNG up to 5 MB</span>
                    </button>
                  )}
                  <input ref={paymentRef} type="file" accept="image/*" className="hidden"
                    onChange={(e) => handlePaymentScreenshot(e.target.files?.[0] ?? null)} />
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1 rounded-full" onClick={() => setStep(1)}>Back</Button>
                  <Button className="flex-1 rounded-full shadow-soft hover:shadow-glow" size="lg"
                    onClick={handleSubmitOrder} disabled={submitting}>
                    {submitting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Placing Order…</> : 'Place Order'}
                  </Button>
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-24 p-5 rounded-2xl bg-card border border-border shadow-card space-y-4">
              <h3 className="font-display text-lg font-semibold">Your Order</h3>
              <div className="flex gap-3">
                <img src={product.image_url} alt={product.name} className="w-16 h-16 rounded-xl object-cover shrink-0 border border-border" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold leading-snug">{product.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Handcrafted · Custom Sized</p>
                  <p className="text-sm font-semibold mt-1">₹{product.price.toFixed(0)}</p>
                </div>
              </div>
              <div className="border-t border-border pt-3 space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>₹{product.price.toFixed(0)}</span></div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className={shippingCost === 0 ? 'text-primary font-medium' : ''}>{shippingCost === 0 ? 'Free' : `₹${shippingCost}`}</span>
                </div>
                <div className="flex justify-between font-semibold text-base border-t border-border pt-2">
                  <span>Total</span><span>₹{orderTotal.toFixed(0)}</span>
                </div>
              </div>
              {step > 0 && (
                <div className="text-xs text-muted-foreground bg-ink-light rounded-xl p-3 space-y-1">
                  <p className="font-semibold text-foreground">Nail Sizing</p>
                  <p>Length: {questionnaire.nail_length}</p>
                  <p>Shape: {questionnaire.nail_shape}</p>
                  {questionnaire.color_preference && <p>Colour: {questionnaire.color_preference}</p>}
                  <p>Photos: {Object.values(nailPhotos).filter(Boolean).length}/{REQUIRED_SLOTS.length} uploaded</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
