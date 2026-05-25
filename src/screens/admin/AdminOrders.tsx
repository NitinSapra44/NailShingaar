import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent } from '@/components/ui/card';
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Loader2, Eye, CheckCircle2, Package, Sparkles } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import type { Order, OrderStatus, PaymentStatus } from '@/types';

const ORDER_STATUSES: OrderStatus[] = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
const PAYMENT_STATUSES: PaymentStatus[] = ['pending', 'screenshot_uploaded', 'confirmed', 'failed'];

const statusBadge: Record<OrderStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  shipped: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

const paymentBadge: Record<PaymentStatus, string> = {
  pending: 'bg-gray-100 text-gray-700',
  screenshot_uploaded: 'bg-orange-100 text-orange-800',
  confirmed: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800',
};

const paymentLabel: Record<PaymentStatus, string> = {
  pending: 'Awaiting payment',
  screenshot_uploaded: 'Screenshot received',
  confirmed: 'Payment confirmed',
  failed: 'Payment failed',
};

const isCustomEnquiry = (order: Order) => {
  try { return JSON.parse(order.notes ?? '{}').type === 'custom_design'; } catch { return false; }
};
const getDesignPhotos = (order: Order): string[] => {
  try { return JSON.parse(order.notes ?? '{}').design_photos ?? []; } catch { return []; }
};
const getStyleNotes = (order: Order): string => {
  try { return JSON.parse(order.notes ?? '{}').style_notes ?? ''; } catch { return ''; }
};

export const AdminOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [trackingInput, setTrackingInput] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      setOrders((data ?? []) as Order[]);
    }
    setLoading(false);
  };

  const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
    setUpdatingId(orderId);
    const { error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', orderId);
    if (error) {
      toast({ title: 'Update failed', description: error.message, variant: 'destructive' });
    } else {
      setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status } : o)));
      if (selectedOrder?.id === orderId) setSelectedOrder((prev) => prev ? { ...prev, status } : prev);
      toast({ title: 'Status updated' });
    }
    setUpdatingId(null);
  };

  const confirmPayment = async (orderId: string) => {
    setUpdatingId(orderId);
    const { error } = await supabase
      .from('orders')
      .update({ payment_status: 'confirmed', status: 'confirmed' })
      .eq('id', orderId);
    if (error) {
      toast({ title: 'Update failed', description: error.message, variant: 'destructive' });
    } else {
      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId ? { ...o, payment_status: 'confirmed', status: 'confirmed' } : o
        )
      );
      if (selectedOrder?.id === orderId)
        setSelectedOrder((prev) => prev ? { ...prev, payment_status: 'confirmed', status: 'confirmed' } : prev);
      toast({ title: 'Payment confirmed', description: 'Order moved to Confirmed.' });
    }
    setUpdatingId(null);
  };

  const saveTracking = async (orderId: string) => {
    if (!trackingInput.trim()) return;
    setUpdatingId(orderId);
    const { error } = await supabase
      .from('orders')
      .update({ tracking_number: trackingInput.trim(), status: 'shipped' })
      .eq('id', orderId);
    if (error) {
      toast({ title: 'Update failed', description: error.message, variant: 'destructive' });
    } else {
      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId ? { ...o, tracking_number: trackingInput.trim(), status: 'shipped' } : o
        )
      );
      if (selectedOrder?.id === orderId)
        setSelectedOrder((prev) => prev ? { ...prev, tracking_number: trackingInput.trim(), status: 'shipped' } : prev);
      toast({ title: 'Tracking saved', description: 'Order marked as shipped.' });
    }
    setUpdatingId(null);
  };

  const openDetail = (order: Order) => {
    setSelectedOrder(order);
    setTrackingInput(order.tracking_number ?? '');
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-serif text-3xl text-foreground">Orders</h1>
          <p className="text-muted-foreground mt-1">Review payments, confirm orders, update delivery status</p>
        </div>

        {orders.some((o) => o.payment_status === 'screenshot_uploaded') && (
          <div className="flex items-center gap-3 px-4 py-3 bg-orange-50 border border-orange-200 rounded-xl text-sm">
            <CheckCircle2 className="h-5 w-5 text-orange-500 shrink-0" />
            <p className="text-orange-800 font-medium">
              {orders.filter((o) => o.payment_status === 'screenshot_uploaded').length} order(s) have payment screenshots waiting for your confirmation.
            </p>
          </div>
        )}
        {orders.some((o) => isCustomEnquiry(o) && o.status === 'pending') && (
          <div className="flex items-center gap-3 px-4 py-3 bg-rose-50 border border-rose-200 rounded-xl text-sm">
            <Sparkles className="h-5 w-5 text-primary shrink-0" />
            <p className="text-rose-800 font-medium">
              {orders.filter((o) => isCustomEnquiry(o) && o.status === 'pending').length} new custom design enquir{orders.filter((o) => isCustomEnquiry(o) && o.status === 'pending').length === 1 ? 'y' : 'ies'} waiting for your review & price quote.
            </p>
          </div>
        )}

        <Card>
          <CardContent className="p-0">
            {loading && (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            )}
            {!loading && orders.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">No orders yet.</div>
            )}
            {!loading && orders.length > 0 && (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Nail Specs</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Payment</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map((order) => {
                      const enquiry = isCustomEnquiry(order);
                      return (
                      <TableRow
                        key={order.id}
                        className={enquiry ? 'bg-rose-50/60' : order.payment_status === 'screenshot_uploaded' ? 'bg-orange-50/60' : ''}
                      >
                        <TableCell className="font-mono text-sm text-muted-foreground">
                          <div className="flex flex-col gap-1">
                            {order.id.slice(0, 8).toUpperCase()}
                            {enquiry && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-primary bg-rose-100 px-1.5 py-0.5 rounded-full w-fit">
                                <Sparkles className="h-2.5 w-2.5" /> Custom
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <p className="font-medium text-sm">{order.shipping_name}</p>
                          <p className="text-xs text-muted-foreground">{order.shipping_phone}</p>
                          <p className="text-xs text-muted-foreground">{order.shipping_city}</p>
                        </TableCell>
                        <TableCell>
                          <p className="text-xs">{order.nail_length ?? '—'} · {order.nail_shape ?? '—'}</p>
                          {order.color_preference && (
                            <p className="text-xs text-muted-foreground truncate max-w-[120px]">{order.color_preference}</p>
                          )}
                        </TableCell>
                        <TableCell className="font-semibold">
                          {enquiry ? <span className="text-primary text-xs font-medium">Price TBD</span> : `₹${order.total}`}
                        </TableCell>
                        <TableCell>
                          {enquiry
                            ? <Badge className="text-xs bg-rose-100 text-rose-800">Awaiting quote</Badge>
                            : <Badge className={`text-xs ${paymentBadge[order.payment_status as PaymentStatus] ?? paymentBadge.pending}`}>
                                {paymentLabel[order.payment_status as PaymentStatus] ?? order.payment_status}
                              </Badge>
                          }
                        </TableCell>
                        <TableCell>
                          <Select
                            value={order.status}
                            onValueChange={(v) => updateOrderStatus(order.id, v as OrderStatus)}
                            disabled={updatingId === order.id}
                          >
                            <SelectTrigger className="h-8 text-xs w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {ORDER_STATUSES.map((s) => (
                                <SelectItem key={s} value={s} className="text-xs capitalize">{s}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-xs whitespace-nowrap">
                          {format(new Date(order.created_at), 'dd MMM yyyy')}
                        </TableCell>
                        <TableCell>
                          <Button size="sm" variant="outline" className="h-8 rounded-lg" onClick={() => openDetail(order)}>
                            <Eye className="h-3.5 w-3.5 mr-1" /> View
                          </Button>
                        </TableCell>
                      </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Order detail dialog ─────────────────────────────────────── */}
      <Dialog open={!!selectedOrder} onOpenChange={(open) => { if (!open) setSelectedOrder(null); }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedOrder && (
            <>
              <DialogHeader>
                <DialogTitle className="font-serif text-xl flex items-center gap-2">
                  {isCustomEnquiry(selectedOrder) && <Sparkles className="h-5 w-5 text-primary" />}
                  {isCustomEnquiry(selectedOrder) ? 'Custom Enquiry' : 'Order'} #{selectedOrder.id.slice(0, 8).toUpperCase()}
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-6 mt-2">
                {/* Custom enquiry banner */}
                {isCustomEnquiry(selectedOrder) && (
                  <div className="px-4 py-3 bg-rose-50 border border-rose-200 rounded-xl text-sm text-rose-800">
                    <p className="font-semibold">Custom Design Enquiry</p>
                    <p className="text-xs mt-0.5">Contact the customer on <span className="font-medium">{selectedOrder.shipping_phone}</span> with a price quote, then confirm the order once payment is received.</p>
                  </div>
                )}

                {/* Customer info */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Customer</p>
                    <p className="font-medium">{selectedOrder.shipping_name}</p>
                    <p>{selectedOrder.shipping_phone}</p>
                    <p className="text-muted-foreground">{selectedOrder.shipping_address}</p>
                    <p className="text-muted-foreground">{selectedOrder.shipping_city}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Nail Specifications</p>
                    <p><span className="font-medium">Length:</span> {selectedOrder.nail_length ?? '—'}</p>
                    <p><span className="font-medium">Shape:</span> {selectedOrder.nail_shape ?? '—'}</p>
                    {selectedOrder.color_preference && (
                      <p><span className="font-medium">Colour:</span> {selectedOrder.color_preference}</p>
                    )}
                  </div>
                </div>

                {/* Design reference photos (custom enquiries only) */}
                {isCustomEnquiry(selectedOrder) && getDesignPhotos(selectedOrder).length > 0 && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-2 font-medium">Design Reference Photos</p>
                    <div className="grid grid-cols-4 gap-2">
                      {getDesignPhotos(selectedOrder).map((url) => (
                        <a key={url} href={url} target="_blank" rel="noopener noreferrer">
                          <img src={url} alt="Design reference"
                            className="aspect-square w-full object-cover rounded-lg border border-border hover:opacity-90 transition-opacity" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Style notes (custom enquiries only) */}
                {isCustomEnquiry(selectedOrder) && getStyleNotes(selectedOrder) && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1 font-medium">Style Notes from Customer</p>
                    <p className="text-sm bg-muted/50 rounded-xl px-4 py-3">{getStyleNotes(selectedOrder)}</p>
                  </div>
                )}

                {/* Nail photos */}
                {selectedOrder.nail_photos && selectedOrder.nail_photos.length > 0 && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-2 font-medium">Nail Size Photos</p>
                    <div className="grid grid-cols-4 gap-2">
                      {selectedOrder.nail_photos.map((url) => (
                        <a key={url} href={url} target="_blank" rel="noopener noreferrer">
                          <img src={url} alt="Customer nail sizing"
                            className="aspect-square w-full object-cover rounded-lg border border-border hover:opacity-90 transition-opacity" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Payment screenshot — only for regular orders */}
                {!isCustomEnquiry(selectedOrder) && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-2 font-medium">Payment Screenshot</p>
                    {selectedOrder.payment_screenshot ? (
                      <div className="space-y-3">
                        <a href={selectedOrder.payment_screenshot} target="_blank" rel="noopener noreferrer">
                          <img src={selectedOrder.payment_screenshot} alt="Payment screenshot"
                            className="rounded-xl border border-border max-h-64 object-contain hover:opacity-90 transition-opacity" />
                        </a>
                        {selectedOrder.payment_status !== 'confirmed' && (
                          <Button onClick={() => confirmPayment(selectedOrder.id)}
                            disabled={updatingId === selectedOrder.id}
                            className="rounded-full bg-green-600 hover:bg-green-700 text-white shadow-soft">
                            {updatingId === selectedOrder.id
                              ? <Loader2 className="h-4 w-4 animate-spin mr-2" />
                              : <CheckCircle2 className="h-4 w-4 mr-2" />}
                            Confirm Payment & Approve Order
                          </Button>
                        )}
                        {selectedOrder.payment_status === 'confirmed' && (
                          <p className="text-sm text-green-700 font-medium flex items-center gap-1.5">
                            <CheckCircle2 className="h-4 w-4" /> Payment confirmed
                          </p>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No screenshot uploaded yet.</p>
                    )}
                  </div>
                )}

                {/* Order status */}
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground font-medium">
                    {isCustomEnquiry(selectedOrder) ? 'Enquiry Status' : 'Order Status'}
                  </p>
                  <Select value={selectedOrder.status}
                    onValueChange={(v) => updateOrderStatus(selectedOrder.id, v as OrderStatus)}
                    disabled={updatingId === selectedOrder.id}>
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
                    <Package className="h-3.5 w-3.5" /> Tracking Number (Shiprocket AWB)
                  </p>
                  <div className="flex gap-2">
                    <Input placeholder="Paste tracking / AWB number" value={trackingInput}
                      onChange={(e) => setTrackingInput(e.target.value)} className="rounded-xl flex-1" />
                    <Button onClick={() => saveTracking(selectedOrder.id)}
                      disabled={updatingId === selectedOrder.id || !trackingInput.trim()}
                      className="rounded-xl shrink-0">
                      Save & Mark Shipped
                    </Button>
                  </div>
                  {selectedOrder.tracking_number && (
                    <p className="text-xs text-muted-foreground font-mono">Current: {selectedOrder.tracking_number}</p>
                  )}
                </div>

                {/* Total */}
                <div className="border-t border-border pt-4 flex justify-between font-semibold">
                  <span>{isCustomEnquiry(selectedOrder) ? 'Price' : 'Order Total'}</span>
                  <span>{isCustomEnquiry(selectedOrder) ? 'To be confirmed' : `₹${selectedOrder.total}`}</span>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};
