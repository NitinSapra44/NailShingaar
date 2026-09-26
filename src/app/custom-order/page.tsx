'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Check, ChevronRight, Upload, X, Camera, Loader2, Info, Sparkles } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { NailQuestionnaire, ShippingDetails } from '@/types';

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
];
const STEPS = ['Your Design', 'Nail Sizing', 'Your Details'];

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

export default function CustomOrderPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  // Step 0 — design
  const [designPhotos, setDesignPhotos] = useState<File[]>([]);
  const [designPreviews, setDesignPreviews] = useState<string[]>([]);
  const designRef = useRef<HTMLInputElement | null>(null);
  const [styleNotes, setStyleNotes] = useState('');
  const [questionnaire, setQuestionnaire] = useState<Omit<NailQuestionnaire, 'nail_photos'>>({
    nail_length: 'Medium', nail_shape: 'Oval', color_preference: '',
  });

  // Step 1 — nail sizing photos
  const [nailPhotos, setNailPhotos] = useState<Record<string, File | null>>({
    left_fingers: null, left_thumb: null, right_fingers: null, right_thumb: null,
  });
  const [photoPreviews, setPhotoPreviews] = useState<Record<string, string>>({});
  const photoRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const [extraPhotos, setExtraPhotos] = useState<File[]>([]);
  const [extraPreviews, setExtraPreviews] = useState<string[]>([]);
  const extraPhotoRef = useRef<HTMLInputElement | null>(null);

  // Step 2 — contact & shipping
  const [shipping, setShipping] = useState<ShippingDetails>({ full_name: '', phone: '', address: '', city: '', pincode: '' });

  const addDesignPhoto = (file: File | null) => {
    if (!file) return;
    setDesignPhotos((prev) => [...prev, file]);
    setDesignPreviews((prev) => [...prev, URL.createObjectURL(file)]);
  };

  const removeDesignPhoto = (i: number) => {
    setDesignPhotos((prev) => prev.filter((_, idx) => idx !== i));
    setDesignPreviews((prev) => prev.filter((_, idx) => idx !== i));
  };

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

  const validateDesign = () => {
    if (designPhotos.length === 0) {
      toast({ title: 'Design photo required', description: 'Please upload at least one reference photo of your design.', variant: 'destructive' });
      return false;
    }
    return true;
  };

  const validateQuestionnaire = () => {
    const uploaded = Object.values(nailPhotos).filter(Boolean);
    if (uploaded.length < 4) {
      toast({ title: 'Photos required', description: 'Please upload all 4 nail photos using the coin method.', variant: 'destructive' });
      return false;
    }
    return true;
  };

  const validateShipping = () => {
    const { full_name, phone, address, city, pincode } = shipping;
    if (!full_name.trim() || !phone.trim() || !address.trim() || !city.trim() || !pincode.trim()) {
      toast({ title: 'Incomplete details', description: 'Please fill in all fields.', variant: 'destructive' });
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

  const handleSubmitEnquiry = async () => {
    if (!validateShipping()) return;
    if (!user) { router.push('/auth?redirect=/custom-order'); return; }
    setSubmitting(true);
    try {
      const ts = Date.now();

      const designPhotoUrls: string[] = [];
      for (let i = 0; i < designPhotos.length; i++) {
        const file = designPhotos[i];
        designPhotoUrls.push(await uploadFile('nail-photos', file, `${user.id}/${ts}_design_${i}.${file.name.split('.').pop()}`));
      }

      const nailPhotoUrls: string[] = [];
      for (const slot of REQUIRED_SLOTS) {
        const file = nailPhotos[slot.key];
        if (file) nailPhotoUrls.push(await uploadFile('nail-photos', file, `${user.id}/${ts}_${slot.key}.${file.name.split('.').pop()}`));
      }
      for (let i = 0; i < extraPhotos.length; i++) {
        const file = extraPhotos[i];
        nailPhotoUrls.push(await uploadFile('nail-photos', file, `${user.id}/${ts}_extra_${i}.${file.name.split('.').pop()}`));
      }

      const { data: order, error: orderError } = await supabase.from('orders').insert({
        user_id: user.id,
        status: 'pending',
        total: 0,
        shipping_name: shipping.full_name,
        shipping_phone: shipping.phone,
        shipping_address: `${shipping.address}, ${shipping.pincode}`,
        shipping_city: shipping.city,
        nail_length: questionnaire.nail_length,
        nail_shape: questionnaire.nail_shape,
        color_preference: questionnaire.color_preference || null,
        nail_photos: nailPhotoUrls,
        payment_status: 'pending',
        notes: JSON.stringify({
          type: 'custom_design',
          style_notes: styleNotes || null,
          design_photos: designPhotoUrls,
        }),
      }).select().single();

      if (orderError) throw new Error(orderError.message);

      await supabase.from('order_items').insert({
        order_id: order.id,
        product_id: null,
        product_name: 'Custom Design — Press-On Nails',
        product_image: designPhotoUrls[0] ?? null,
        size: questionnaire.nail_shape,
        quantity: 1,
        price: 0,
      });

      router.push(`/order-confirmation/${order.id}`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to submit enquiry. Please try again.';
      toast({ title: 'Submission failed', description: message, variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-10 max-w-4xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-pink-light text-primary px-4 py-1.5 rounded-full text-sm font-medium mb-3">
            <Sparkles className="h-3.5 w-3.5" /> Custom Design Enquiry
          </div>
          <h1 className="font-display text-3xl font-semibold mb-2">Bring Your Vision to Life</h1>
          <p className="text-muted-foreground text-sm">Share your details and Reet will get in touch with a personalised price quote</p>
        </div>

        <StepBar current={step} />

        <div className="grid lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2">

            {/* Step 0 — Your Design */}
            {step === 0 && (
              <div className="space-y-8 animate-fade-up">
                <h2 className="font-display text-xl font-semibold">Your Design</h2>

                <div className="space-y-3">
                  <Label className="text-base font-semibold">1. Design Reference Photos <span className="text-primary">*</span></Label>
                  <p className="text-sm text-muted-foreground">Upload photos of the nail design you want — screenshots from Pinterest, Instagram, or your own sketch. At least one photo is required.</p>
                  <div className="flex flex-wrap gap-3">
                    {designPreviews.map((src, i) => (
                      <div key={src} className="relative w-24 h-24">
                        <img src={src} alt={`Design ${i + 1}`} className="w-full h-full rounded-xl object-cover border border-border" />
                        <button type="button" onClick={() => removeDesignPhoto(i)}
                          className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-foreground/70 text-background flex items-center justify-center">
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                    <button type="button" onClick={() => designRef.current?.click()}
                      className="w-24 h-24 rounded-xl border-2 border-dashed border-border bg-muted/40 flex flex-col items-center justify-center gap-1 hover:border-primary/50 hover:bg-pink-light/30 transition-colors">
                      <Upload className="h-5 w-5 text-muted-foreground" />
                      <span className="text-[10px] text-muted-foreground text-center leading-tight">Add photo</span>
                    </button>
                  </div>
                  <input ref={designRef} type="file" accept="image/*" className="hidden"
                    onChange={(e) => { addDesignPhoto(e.target.files?.[0] ?? null); e.target.value = ''; }} />
                </div>

                <div className="space-y-2">
                  <Label className="text-base font-semibold">2. Style & Colour Notes <span className="font-normal text-muted-foreground">(optional)</span></Label>
                  <Textarea
                    placeholder="e.g. Nude pink base, gold chrome on ring finger, tiny flowers on pinky, coffin shape, medium length…"
                    value={styleNotes}
                    onChange={(e) => setStyleNotes(e.target.value)}
                    className="rounded-xl resize-none" rows={4} />
                  <p className="text-xs text-muted-foreground">The more detail you share, the better Reet can match your vision.</p>
                </div>

                <div className="space-y-2">
                  <Label className="text-base font-semibold">3. Nail Shape</Label>
                  <div className="grid grid-cols-3 gap-3">
                    {NAIL_SHAPES.map((shape) => (
                      <button key={shape.id} type="button" onClick={() => setQuestionnaire({ ...questionnaire, nail_shape: shape.id })}
                        className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${questionnaire.nail_shape === shape.id ? 'border-primary bg-pink-light shadow-soft' : 'border-border bg-card hover:border-primary/40'}`}>
                        <img src={shape.image} alt={shape.label} className="w-12 h-14 object-cover rounded-lg" />
                        <div className="text-center">
                          <p className="text-xs font-semibold leading-tight">{shape.label}</p>
                          <p className="text-[10px] text-muted-foreground leading-tight">{shape.desc}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-base font-semibold">4. Nail Length</Label>
                  <div className="flex gap-3 flex-wrap">
                    {NAIL_LENGTHS.map((len) => (
                      <button key={len} type="button" onClick={() => setQuestionnaire({ ...questionnaire, nail_length: len })}
                        className={`flex-1 min-w-[90px] py-3 px-4 rounded-xl border-2 font-medium text-sm transition-all ${questionnaire.nail_length === len ? 'border-primary bg-pink-light text-primary shadow-soft' : 'border-border bg-card hover:border-primary/40'}`}>
                        {len}
                      </button>
                    ))}
                  </div>
                </div>

                <Button className="w-full rounded-full shadow-soft hover:shadow-glow" size="lg"
                  onClick={() => { if (validateDesign()) setStep(1); }}>
                  Continue to Nail Sizing <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            )}

            {/* Step 1 — Nail Sizing Photos */}
            {step === 1 && (
              <div className="space-y-8 animate-fade-up">
                <h2 className="font-display text-xl font-semibold">Nail Sizing Photos</h2>

                <div className="space-y-3">
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
                      <div key={slot.key}>
                        <p className="text-xs font-semibold mb-0.5">{slot.label}</p>
                        <p className="text-xs text-muted-foreground mb-2">{slot.hint}</p>
                        {photoPreviews[slot.key] ? (
                          <div className="relative aspect-square rounded-xl overflow-hidden border border-border">
                            <img src={photoPreviews[slot.key]} alt={slot.label} className="w-full h-full object-cover" />
                            <button type="button" onClick={() => handlePhotoChange(slot.key, null)}
                              className="absolute top-1.5 right-1.5 h-6 w-6 rounded-full bg-foreground/70 text-background flex items-center justify-center">
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ) : (
                          <button type="button" onClick={() => photoRefs.current[slot.key]?.click()}
                            className="aspect-square w-full rounded-xl border-2 border-dashed border-border bg-muted/40 flex flex-col items-center justify-center gap-1 hover:border-primary/50 hover:bg-pink-light/30 transition-colors">
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

                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1 rounded-full" onClick={() => setStep(0)}>Back</Button>
                  <Button className="flex-1 rounded-full shadow-soft hover:shadow-glow" size="lg"
                    onClick={() => { if (validateQuestionnaire()) setStep(2); }}>
                    Continue to Your Details <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Step 2 — Contact & Shipping */}
            {step === 2 && (
              <div className="space-y-6 animate-fade-up">
                <div>
                  <h2 className="font-display text-xl font-semibold">Your Details</h2>
                  <p className="text-sm text-muted-foreground mt-1">Reet will use these to reach out with your personalised price quote and to ship your order once confirmed.</p>
                </div>

                <div className="flex items-start gap-2 px-4 py-3 bg-ink-light rounded-xl border border-border text-sm">
                  <Sparkles className="h-4 w-4 mt-0.5 shrink-0 text-primary" />
                  <p className="text-muted-foreground">No payment now — you'll only pay once Reet confirms the price with you directly.</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 space-y-1.5">
                    <Label>Full Name</Label>
                    <Input placeholder="Your full name" value={shipping.full_name}
                      onChange={(e) => setShipping({ ...shipping, full_name: e.target.value })} className="rounded-xl" />
                  </div>
                  <div className="col-span-2 space-y-1.5">
                    <Label>Phone / WhatsApp Number</Label>
                    <Input type="tel" placeholder="10-digit mobile number" value={shipping.phone}
                      onChange={(e) => setShipping({ ...shipping, phone: e.target.value })} className="rounded-xl" />
                  </div>
                  <div className="col-span-2 space-y-1.5">
                    <Label>Shipping Address</Label>
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
                  <Button variant="outline" className="flex-1 rounded-full" onClick={() => setStep(1)}>Back</Button>
                  <Button className="flex-1 rounded-full shadow-soft hover:shadow-glow" size="lg"
                    onClick={handleSubmitEnquiry} disabled={submitting}>
                    {submitting
                      ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Submitting…</>
                      : <><Sparkles className="h-4 w-4 mr-2" />Submit Enquiry</>}
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 p-5 rounded-2xl bg-card border border-border shadow-card space-y-4">
              <h3 className="font-display text-lg font-semibold">Enquiry Summary</h3>
              <div className="flex gap-3">
                {designPreviews[0] ? (
                  <img src={designPreviews[0]} alt="Your design" className="w-16 h-16 rounded-xl object-cover shrink-0 border border-border" />
                ) : (
                  <div className="w-16 h-16 rounded-xl bg-pink-light shrink-0 border border-border flex items-center justify-center">
                    <Sparkles className="h-6 w-6 text-primary" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold leading-snug">Custom Design — Press-On Nails</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Handcrafted · Custom Sized</p>
                  <p className="text-sm font-medium text-primary mt-1">Price TBD</p>
                </div>
              </div>

              <div className="text-xs bg-ink-light rounded-xl p-3 space-y-1 text-muted-foreground">
                <p className="font-semibold text-foreground">How it works</p>
                <p>1. Submit your enquiry</p>
                <p>2. Reet reviews your design & photos</p>
                <p>3. You receive a WhatsApp/call with a price</p>
                <p>4. Pay & your nails get crafted</p>
              </div>

              {step > 0 && (
                <div className="text-xs text-muted-foreground bg-muted/40 rounded-xl p-3 space-y-1 border border-border">
                  {designPhotos.length > 0 && <p><span className="font-semibold text-foreground">Design: </span>{designPhotos.length} photo{designPhotos.length > 1 ? 's' : ''}</p>}
                  {styleNotes && <p className="line-clamp-2"><span className="font-semibold text-foreground">Notes: </span>{styleNotes}</p>}
                  <p><span className="font-semibold text-foreground">Shape: </span>{questionnaire.nail_shape} · <span className="font-semibold text-foreground">Length: </span>{questionnaire.nail_length}</p>
                  {step > 1 && <p><span className="font-semibold text-foreground">Sizing photos: </span>{Object.values(nailPhotos).filter(Boolean).length}/4</p>}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
