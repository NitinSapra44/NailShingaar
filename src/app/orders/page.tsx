'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Package, Clock, CheckCircle2, Truck, Star, ArrowRight, ChevronDown, ChevronUp, LogOut, Sparkles } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { format } from 'date-fns';
import type { Order, OrderStatus, PaymentStatus } from '@/types';

const isCustomEnquiry = (order: Order) => {
  try { return JSON.parse(order.notes ?? '{}').type === 'custom_design'; } catch { return false; }
};

const statusConfig: Record<OrderStatus, { label: string; color: string; icon: React.ElementType }> = {
  pending:   { label: 'Pending',   color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  confirmed: { label: 'Confirmed', color: 'bg-blue-100 text-blue-800',     icon: CheckCircle2 },
  shipped:   { label: 'Shipped',   color: 'bg-purple-100 text-purple-800', icon: Truck },
  delivered: { label: 'Delivered', color: 'bg-green-100 text-green-800',   icon: Star },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-800',       icon: Package },
};
const paymentConfig: Record<PaymentStatus, { label: string; color: string }> = {
  pending:             { label: 'Payment pending',     color: 'bg-gray-100 text-gray-600' },
  screenshot_uploaded: { label: 'Screenshot received', color: 'bg-orange-100 text-orange-700' },
  confirmed:           { label: 'Payment confirmed',   color: 'bg-green-100 text-green-700' },
  failed:              { label: 'Payment failed',      color: 'bg-red-100 text-red-700' },
};
const TIMELINE: OrderStatus[] = ['pending', 'confirmed', 'shipped', 'delivered'];

function OrderCard({ order }: { order: Order }) {
  const [open, setOpen] = useState(false);
  const custom = isCustomEnquiry(order);
  const cfg = statusConfig[order.status];
  const pmtCfg = paymentConfig[order.payment_status];
  const StatusIcon = custom ? Sparkles : cfg.icon;
  const timelineIdx = TIMELINE.indexOf(order.status);

  // Custom enquiry states
  const awaitingQuote   = custom && order.total === 0 && order.status === 'pending';
  const readyToPay      = custom && order.total > 0 && order.payment_status === 'pending';
  const screenshotSent  = custom && order.payment_status === 'screenshot_uploaded';

  const borderCls = readyToPay
    ? 'border-primary shadow-glow'
    : custom ? 'border-primary/30' : 'border-border';

  const badgeLabel = readyToPay ? 'Awaiting Payment' : screenshotSent ? 'Screenshot Sent' : cfg.label;
  const badgeColor = readyToPay ? 'bg-pink-100 text-primary' : screenshotSent ? 'bg-orange-100 text-orange-700' : cfg.color;

  return (
    <div className={`rounded-2xl bg-card border shadow-soft overflow-hidden ${borderCls}`}>
      <button className="w-full flex items-center justify-between p-5 text-left" onClick={() => setOpen(!open)}>
        <div className="flex items-center gap-3">
          <div className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 ${custom ? 'bg-pink-light' : 'bg-pink-light'}`}>
            <StatusIcon className="h-5 w-5 text-primary" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="font-semibold text-sm">{custom ? 'Custom Enquiry' : 'Order'} #{order.id.slice(0, 8).toUpperCase()}</p>
              {custom && <span className="text-[10px] font-semibold bg-rose-100 text-primary px-2 py-0.5 rounded-full">Custom</span>}
            </div>
            <p className="text-xs text-muted-foreground">{format(new Date(order.created_at), 'd MMM yyyy')}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${badgeColor}`}>{badgeLabel}</span>
          <span className="font-semibold text-sm">
            {custom && order.total === 0 ? 'Price TBD' : `₹${order.total.toFixed(0)}`}
          </span>
          {open ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
        </div>
      </button>

      {/* Pay Now CTA — always visible when ready */}
      {readyToPay && (
        <div className="px-5 pb-4 flex items-center justify-between gap-4 bg-pink-light/40 border-t border-primary/20 pt-3">
          <div>
            <p className="text-sm font-semibold text-foreground">Price confirmed: ₹{order.total.toFixed(0)}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Reet has reviewed your design and set a price. Pay to start crafting!</p>
          </div>
          <Button asChild size="sm" className="rounded-full shadow-soft hover:shadow-glow shrink-0">
            <Link href={`/pay/${order.id}`}>Pay Now <ArrowRight className="ml-1.5 h-3.5 w-3.5" /></Link>
          </Button>
        </div>
      )}

      {screenshotSent && (
        <div className="px-5 pb-4 flex items-center gap-3 bg-orange-50/60 border-t border-orange-200 pt-3">
          <Clock className="h-4 w-4 text-orange-500 shrink-0" />
          <p className="text-xs text-orange-800 font-medium">Payment screenshot received — Reet will confirm and start crafting shortly.</p>
        </div>
      )}

      {awaitingQuote && (
        <div className="px-5 pb-4 flex items-center gap-3 bg-ink-light border-t border-border pt-3">
          <Sparkles className="h-4 w-4 text-primary shrink-0" />
          <p className="text-xs text-muted-foreground">Reet is reviewing your design. You'll receive a WhatsApp/call with your price quote soon.</p>
        </div>
      )}

      {open && (
        <div className="px-5 pb-5 space-y-4 border-t border-border pt-4">
          {timelineIdx >= 0 && (
            <div className="flex items-center gap-1">
              {TIMELINE.map((s, i) => (
                <div key={s} className="flex items-center flex-1 last:flex-none">
                  <div className={`h-2 w-2 rounded-full shrink-0 ${i <= timelineIdx ? 'bg-primary' : 'bg-border'}`} />
                  {i < TIMELINE.length - 1 && <div className={`flex-1 h-0.5 ${i < timelineIdx ? 'bg-primary' : 'bg-border'}`} />}
                </div>
              ))}
            </div>
          )}
          <Badge className={`text-xs ${pmtCfg.color} border-0`}>{pmtCfg.label}</Badge>
          {order.nail_length && (
            <div className="text-xs bg-ink-light rounded-xl p-3 space-y-0.5">
              <p className="font-semibold text-foreground">Nail Specs</p>
              <p>Length: {order.nail_length} · Shape: {order.nail_shape}</p>
              {order.color_preference && <p>Colour: {order.color_preference}</p>}
            </div>
          )}
          {order.tracking_number && (
            <div className="flex items-center justify-between text-sm p-3 rounded-xl bg-purple-50 border border-purple-100">
              <div>
                <p className="font-semibold text-purple-900 text-xs uppercase tracking-wide">Tracking Number</p>
                <p className="font-mono font-semibold text-purple-800 mt-0.5">{order.tracking_number}</p>
              </div>
              <Truck className="w-5 h-5 text-purple-400" />
            </div>
          )}
          <div className="text-sm text-muted-foreground">
            <p className="font-semibold text-foreground text-xs uppercase tracking-wide mb-1">Shipping To</p>
            <p>{order.shipping_name}</p>
            <p>{order.shipping_address}</p>
            <p>{order.shipping_city} · {order.shipping_phone}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function OrdersPage() {
  const { user, loading: authLoading, signOut } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    supabase.from('orders').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
      .then(({ data }) => { setOrders((data ?? []) as Order[]); setLoading(false); });
  }, [user]);

  if (authLoading || loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 max-w-2xl space-y-4">
          {[1,2,3].map((n) => <div key={n} className="h-20 rounded-2xl bg-muted animate-pulse" />)}
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12 max-w-2xl">
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-semibold">My Orders</h1>
            <p className="text-muted-foreground mt-1 text-sm">Track your handcrafted nail sets</p>
          </div>
          <Button variant="outline" size="sm" onClick={signOut} className="rounded-full shrink-0 gap-2">
            <LogOut className="h-4 w-4" /> Sign Out
          </Button>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-20 space-y-4">
            <div className="w-16 h-16 rounded-full bg-pink-light flex items-center justify-center mx-auto">
              <Package className="w-8 h-8 text-primary" />
            </div>
            <h2 className="font-display text-xl font-semibold">No orders yet</h2>
            <p className="text-muted-foreground text-sm">Explore our collections and order your first custom nail set!</p>
            <Button asChild className="rounded-full mt-4">
              <Link href="/shop">Shop Now <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => <OrderCard key={order.id} order={order} />)}
          </div>
        )}
      </div>
    </Layout>
  );
}
