'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Loader2, Sparkles, Phone, MapPin, CheckCircle2,
  Package, Eye, Clock, ChevronRight,
} from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import type { Order, OrderStatus } from '@/types';

const ORDER_STATUSES: OrderStatus[] = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];

const statusBadge: Record<OrderStatus, string> = {
  pending:   'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  shipped:   'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

const statusLabel: Record<OrderStatus, string> = {
  pending:   'Awaiting Quote',
  confirmed: 'Confirmed',
  shipped:   'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

const getDesignPhotos = (order: Order): string[] => {
  try { return JSON.parse(order.notes ?? '{}').design_photos ?? []; } catch { return []; }
};
const getStyleNotes = (order: Order): string => {
  try { return JSON.parse(order.notes ?? '{}').style_notes ?? ''; } catch { return ''; }
};

export const AdminEnquiries = () => {
  const [enquiries, setEnquiries] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Order | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [priceInput, setPriceInput] = useState('');
  const [trackingInput, setTrackingInput] = useState('');
  const { toast } = useToast();

  useEffect(() => { fetchEnquiries(); }, []);

  const fetchEnquiries = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      const customOnly = (data ?? []).filter((o) => {
        try { return JSON.parse((o as Order).notes ?? '{}').type === 'custom_design'; } catch { return false; }
      }) as Order[];
      setEnquiries(customOnly);
    }
    setLoading(false);
  };

  const updateStatus = async (id: string, status: OrderStatus) => {
    setUpdatingId(id);
    const { error } = await supabase.from('orders').update({ status }).eq('id', id);
    if (error) {
      toast({ title: 'Update failed', description: error.message, variant: 'destructive' });
    } else {
      setEnquiries((prev) => prev.map((o) => o.id === id ? { ...o, status } : o));
      if (selected?.id === id) setSelected((prev) => prev ? { ...prev, status } : prev);
      toast({ title: 'Status updated' });
    }
    setUpdatingId(null);
  };

  const saveQuotedPrice = async (id: string) => {
    const price = parseFloat(priceInput);
    if (!priceInput || isNaN(price) || price <= 0) {
      toast({ title: 'Invalid price', description: 'Enter a valid price above 0.', variant: 'destructive' });
      return;
    }
    setUpdatingId(id);
    const { error } = await supabase.from('orders').update({ total: price, payment_status: 'pending' }).eq('id', id);
    if (error) {
      toast({ title: 'Update failed', description: error.message, variant: 'destructive' });
    } else {
      setEnquiries((prev) => prev.map((o) => o.id === id ? { ...o, total: price } : o));
      if (selected?.id === id) setSelected((prev) => prev ? { ...prev, total: price } : prev);
      toast({ title: 'Price quoted', description: `₹${price} saved. Now share payment details with the customer.` });
    }
    setUpdatingId(null);
  };

  const confirmPayment = async (id: string) => {
    setUpdatingId(id);
    const { error } = await supabase
      .from('orders')
      .update({ payment_status: 'confirmed', status: 'confirmed' })
      .eq('id', id);
    if (error) {
      toast({ title: 'Update failed', description: error.message, variant: 'destructive' });
    } else {
      setEnquiries((prev) => prev.map((o) => o.id === id ? { ...o, payment_status: 'confirmed', status: 'confirmed' } : o));
      if (selected?.id === id) setSelected((prev) => prev ? { ...prev, payment_status: 'confirmed', status: 'confirmed' } : prev);
      toast({ title: 'Payment confirmed', description: 'Enquiry moved to Confirmed — start crafting!' });
    }
    setUpdatingId(null);
  };

  const saveTracking = async (id: string) => {
    if (!trackingInput.trim()) return;
    setUpdatingId(id);
    const { error } = await supabase
      .from('orders')
      .update({ tracking_number: trackingInput.trim(), status: 'shipped' })
      .eq('id', id);
    if (error) {
      toast({ title: 'Update failed', description: error.message, variant: 'destructive' });
    } else {
      setEnquiries((prev) => prev.map((o) => o.id === id ? { ...o, tracking_number: trackingInput.trim(), status: 'shipped' } : o));
      if (selected?.id === id) setSelected((prev) => prev ? { ...prev, tracking_number: trackingInput.trim(), status: 'shipped' } : prev);
      toast({ title: 'Tracking saved', description: 'Enquiry marked as shipped.' });
    }
    setUpdatingId(null);
  };

  const openDetail = (order: Order) => {
    setSelected(order);
    setPriceInput(order.total > 0 ? String(order.total) : '');
    setTrackingInput(order.tracking_number ?? '');
  };

  const pendingCount = enquiries.filter((e) => e.status === 'pending').length;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="font-serif text-3xl text-foreground flex items-center gap-2">
              <Sparkles className="h-7 w-7 text-primary" /> Custom Enquiries
            </h1>
            <p className="text-muted-foreground mt-1">Review designs, quote prices, confirm orders</p>
          </div>
          {pendingCount > 0 && (
            <div className="flex items-center gap-2 px-4 py-2 bg-rose-50 border border-rose-200 rounded-xl text-sm text-rose-800 font-medium">
              <Clock className="h-4 w-4" />
              {pendingCount} awaiting your quote
            </div>
          )}
        </div>

        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {!loading && enquiries.length === 0 && (
          <div className="text-center py-20 text-muted-foreground">
            <Sparkles className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p>No custom enquiries yet.</p>
          </div>
        )}

        {!loading && enquiries.length > 0 && (
          <div className="grid gap-4">
            {enquiries.map((enquiry) => {
              const designPhotos = getDesignPhotos(enquiry);
              const styleNotes = getStyleNotes(enquiry);
              const isPending = enquiry.status === 'pending';

              return (
                <div key={enquiry.id}
                  className={`rounded-2xl border bg-card shadow-soft overflow-hidden ${isPending ? 'border-primary/30' : 'border-border'}`}>
                  {/* Card header */}
                  <div className={`flex items-center justify-between px-5 py-3 border-b ${isPending ? 'bg-rose-50/60 border-primary/20' : 'bg-muted/30 border-border'}`}>
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs text-muted-foreground">{enquiry.id.slice(0, 8).toUpperCase()}</span>
                      <Badge className={`text-xs ${statusBadge[enquiry.status]}`}>
                        {statusLabel[enquiry.status]}
                      </Badge>
                      {enquiry.total > 0 && (
                        <span className="text-xs font-semibold text-primary">₹{enquiry.total} quoted</span>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">{format(new Date(enquiry.created_at), 'dd MMM yyyy · h:mm a')}</span>
                  </div>

                  <div className="p-5 grid md:grid-cols-3 gap-6">
                    {/* Design photos */}
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Design Reference</p>
                      {designPhotos.length > 0 ? (
                        <div className="flex gap-2 flex-wrap">
                          {designPhotos.slice(0, 4).map((url, i) => (
                            <a key={url} href={url} target="_blank" rel="noopener noreferrer">
                              <img src={url} alt={`Design ${i + 1}`}
                                className="w-16 h-16 rounded-xl object-cover border border-border hover:opacity-80 transition-opacity" />
                            </a>
                          ))}
                          {designPhotos.length > 4 && (
                            <div className="w-16 h-16 rounded-xl border border-border bg-muted flex items-center justify-center text-xs text-muted-foreground font-medium">
                              +{designPhotos.length - 4}
                            </div>
                          )}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">No photos</p>
                      )}
                      {styleNotes && (
                        <p className="text-xs text-muted-foreground line-clamp-2 bg-muted/50 rounded-lg px-3 py-2">{styleNotes}</p>
                      )}
                    </div>

                    {/* Nail specs + customer */}
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Nail Specs</p>
                        <p className="text-sm font-medium">{enquiry.nail_length} · {enquiry.nail_shape}</p>
                        {enquiry.color_preference && (
                          <p className="text-xs text-muted-foreground mt-0.5">{enquiry.color_preference}</p>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">
                          {enquiry.nail_photos?.length ?? 0} sizing photo{(enquiry.nail_photos?.length ?? 0) !== 1 ? 's' : ''} uploaded
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Customer</p>
                        <p className="text-sm font-medium">{enquiry.shipping_name}</p>
                        <a href={`https://wa.me/91${enquiry.shipping_phone}`} target="_blank" rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs text-primary font-medium hover:underline mt-0.5">
                          <Phone className="h-3 w-3" /> {enquiry.shipping_phone}
                        </a>
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                          <MapPin className="h-3 w-3" /> {enquiry.shipping_city}
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-3 justify-center">
                      {isPending && (
                        <div className="space-y-2">
                          <p className="text-xs font-semibold text-muted-foreground">Set Quoted Price</p>
                          <div className="flex gap-2">
                            <div className="relative flex-1">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">₹</span>
                              <Input
                                type="number"
                                placeholder="e.g. 1200"
                                className="rounded-xl pl-7 h-9 text-sm"
                                value={selected?.id === enquiry.id ? priceInput : (enquiry.total > 0 ? String(enquiry.total) : '')}
                                onChange={(e) => {
                                  if (selected?.id !== enquiry.id) setSelected(enquiry);
                                  setPriceInput(e.target.value);
                                }}
                              />
                            </div>
                            <Button size="sm" className="rounded-xl h-9 shrink-0"
                              disabled={updatingId === enquiry.id}
                              onClick={() => { setSelected(enquiry); saveQuotedPrice(enquiry.id); }}>
                              {updatingId === enquiry.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Quote'}
                            </Button>
                          </div>
                        </div>
                      )}

                      {enquiry.status === 'confirmed' || (enquiry.total > 0 && enquiry.payment_status === 'pending') ? (
                        enquiry.payment_status !== 'confirmed' ? (
                          <Button size="sm" variant="outline"
                            className="rounded-xl h-9 text-green-700 border-green-300 hover:bg-green-50"
                            disabled={updatingId === enquiry.id}
                            onClick={() => confirmPayment(enquiry.id)}>
                            {updatingId === enquiry.id ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" /> : <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />}
                            Confirm Payment
                          </Button>
                        ) : (
                          <p className="text-xs text-green-700 font-medium flex items-center gap-1.5">
                            <CheckCircle2 className="h-3.5 w-3.5" /> Payment confirmed
                          </p>
                        )
                      ) : null}

                      <Button size="sm" variant="outline" className="rounded-xl h-9"
                        onClick={() => openDetail(enquiry)}>
                        <Eye className="h-3.5 w-3.5 mr-1.5" /> Full Details
                        <ChevronRight className="h-3.5 w-3.5 ml-auto" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Detail dialog */}
      <Dialog open={!!selected} onOpenChange={(open) => { if (!open) setSelected(null); }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle className="font-serif text-xl flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  Enquiry #{selected.id.slice(0, 8).toUpperCase()}
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-6 mt-2">
                {/* Customer */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1 font-medium">Customer</p>
                    <p className="font-semibold">{selected.shipping_name}</p>
                    <a href={`https://wa.me/91${selected.shipping_phone}`} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-primary font-medium hover:underline mt-0.5 text-xs">
                      <Phone className="h-3 w-3" /> {selected.shipping_phone} (WhatsApp)
                    </a>
                    <p className="text-muted-foreground text-xs mt-1">{selected.shipping_address}</p>
                    <p className="text-muted-foreground text-xs">{selected.shipping_city}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1 font-medium">Nail Specs</p>
                    <p><span className="font-medium">Length:</span> {selected.nail_length ?? '—'}</p>
                    <p><span className="font-medium">Shape:</span> {selected.nail_shape ?? '—'}</p>
                    {selected.color_preference && <p><span className="font-medium">Colour:</span> {selected.color_preference}</p>}
                  </div>
                </div>

                {/* Design photos */}
                {getDesignPhotos(selected).length > 0 && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-2 font-medium">Design Reference Photos</p>
                    <div className="grid grid-cols-4 gap-2">
                      {getDesignPhotos(selected).map((url) => (
                        <a key={url} href={url} target="_blank" rel="noopener noreferrer">
                          <img src={url} alt="Design reference"
                            className="aspect-square w-full object-cover rounded-xl border border-border hover:opacity-80 transition-opacity" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Style notes */}
                {getStyleNotes(selected) && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1 font-medium">Style Notes</p>
                    <p className="text-sm bg-muted/50 rounded-xl px-4 py-3">{getStyleNotes(selected)}</p>
                  </div>
                )}

                {/* Nail sizing photos */}
                {selected.nail_photos && selected.nail_photos.length > 0 && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-2 font-medium">Nail Size Photos</p>
                    <div className="grid grid-cols-4 gap-2">
                      {selected.nail_photos.map((url) => (
                        <a key={url} href={url} target="_blank" rel="noopener noreferrer">
                          <img src={url} alt="Nail sizing"
                            className="aspect-square w-full object-cover rounded-xl border border-border hover:opacity-80 transition-opacity" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quoted price */}
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground font-medium">
                    {selected.total > 0 ? `Quoted Price: ₹${selected.total}` : 'Set Quoted Price'}
                  </p>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">₹</span>
                      <Input type="number" placeholder="e.g. 1200"
                        className="rounded-xl pl-7"
                        value={priceInput}
                        onChange={(e) => setPriceInput(e.target.value)} />
                    </div>
                    <Button onClick={() => saveQuotedPrice(selected.id)}
                      disabled={updatingId === selected.id || !priceInput}
                      className="rounded-xl shrink-0">
                      {updatingId === selected.id ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                      Save Price
                    </Button>
                  </div>
                </div>

                {/* Confirm payment */}
                {selected.total > 0 && selected.payment_status !== 'confirmed' && (
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground font-medium">Payment Confirmation</p>
                    <p className="text-xs text-muted-foreground">Once the customer has paid ₹{selected.total}, confirm below to move to crafting.</p>
                    <Button onClick={() => confirmPayment(selected.id)}
                      disabled={updatingId === selected.id}
                      className="rounded-full bg-green-600 hover:bg-green-700 text-white shadow-soft">
                      {updatingId === selected.id
                        ? <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        : <CheckCircle2 className="h-4 w-4 mr-2" />}
                      Confirm Payment & Start Crafting
                    </Button>
                  </div>
                )}
                {selected.payment_status === 'confirmed' && (
                  <p className="text-sm text-green-700 font-medium flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4" /> Payment confirmed — crafting in progress
                  </p>
                )}

                {/* Status */}
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground font-medium">Enquiry Status</p>
                  <Select value={selected.status}
                    onValueChange={(v) => updateStatus(selected.id, v as OrderStatus)}
                    disabled={updatingId === selected.id}>
                    <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {ORDER_STATUSES.map((s) => (
                        <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Tracking */}
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
                    <Package className="h-3.5 w-3.5" /> Tracking Number
                  </p>
                  <div className="flex gap-2">
                    <Input placeholder="Paste AWB / tracking number" value={trackingInput}
                      onChange={(e) => setTrackingInput(e.target.value)} className="rounded-xl flex-1" />
                    <Button onClick={() => saveTracking(selected.id)}
                      disabled={updatingId === selected.id || !trackingInput.trim()}
                      className="rounded-xl shrink-0">
                      Save & Ship
                    </Button>
                  </div>
                  {selected.tracking_number && (
                    <p className="text-xs text-muted-foreground font-mono">Current: {selected.tracking_number}</p>
                  )}
                </div>

                <div className="border-t border-border pt-4 flex justify-between font-semibold text-sm">
                  <span>Quoted Price</span>
                  <span>{selected.total > 0 ? `₹${selected.total}` : 'Not quoted yet'}</span>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};
