import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Package, Clock, CheckCircle2, Truck, Star, ArrowRight, ChevronDown, ChevronUp, LogOut } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { format } from 'date-fns';
import type { Order, OrderStatus, PaymentStatus } from '@/types';

const statusConfig: Record<OrderStatus, { label: string; color: string; icon: React.ElementType }> = {
  pending:   { label: 'Pending',   color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  confirmed: { label: 'Confirmed', color: 'bg-blue-100 text-blue-800',     icon: CheckCircle2 },
  shipped:   { label: 'Shipped',   color: 'bg-purple-100 text-purple-800', icon: Truck },
  delivered: { label: 'Delivered', color: 'bg-green-100 text-green-800',   icon: Star },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-800',       icon: Package },
};

const paymentConfig: Record<PaymentStatus, { label: string; color: string }> = {
  pending:             { label: 'Payment pending',      color: 'bg-gray-100 text-gray-600' },
  screenshot_uploaded: { label: 'Screenshot received',  color: 'bg-orange-100 text-orange-700' },
  confirmed:           { label: 'Payment confirmed',    color: 'bg-green-100 text-green-700' },
  failed:              { label: 'Payment failed',       color: 'bg-red-100 text-red-700' },
};

const TIMELINE: OrderStatus[] = ['pending', 'confirmed', 'shipped', 'delivered'];

function OrderCard({ order }: { order: Order }) {
  const [expanded, setExpanded] = useState(false);
  const status = statusConfig[order.status] ?? statusConfig.pending;
  const payment = paymentConfig[order.payment_status as PaymentStatus] ?? paymentConfig.pending;
  const StatusIcon = status.icon;
  const currentStep = TIMELINE.indexOf(order.status);

  return (
    <div className="rounded-2xl border border-border bg-card shadow-soft overflow-hidden">
      {/* Header row */}
      <div className="p-5 flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
          <StatusIcon className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm">Order #{order.id.slice(0, 8).toUpperCase()}</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {format(new Date(order.created_at), 'dd MMM yyyy')} · ₹{Number(order.total).toLocaleString('en-IN')}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Badge className={`text-xs ${status.color}`}>{status.label}</Badge>
          <button onClick={() => setExpanded(!expanded)} className="text-muted-foreground hover:text-foreground transition-colors">
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div className="border-t border-border px-5 pb-5 pt-4 space-y-5">

          {/* Progress timeline */}
          {order.status !== 'cancelled' && (
            <div className="flex items-center gap-0">
              {TIMELINE.map((s, i) => {
                const done = i <= currentStep;
                const cfg = statusConfig[s];
                const Icon = cfg.icon;
                return (
                  <div key={s} className="flex items-center flex-1 last:flex-none">
                    <div className="flex flex-col items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${done ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] mt-1 text-muted-foreground capitalize">{cfg.label}</span>
                    </div>
                    {i < TIMELINE.length - 1 && (
                      <div className={`flex-1 h-0.5 mx-1 rounded-full mb-4 ${i < currentStep ? 'bg-primary' : 'bg-border'}`} />
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Payment status */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Payment</span>
            <Badge className={`text-xs ${payment.color}`}>{payment.label}</Badge>
          </div>

          {/* Nail specs */}
          {(order.nail_length || order.nail_shape) && (
            <div className="p-3 rounded-xl bg-ink-light space-y-1 text-sm">
              <p className="font-semibold text-xs text-muted-foreground uppercase tracking-wide mb-2">Your Nail Specs</p>
              {order.nail_length && <p><span className="text-muted-foreground">Length:</span> {order.nail_length}</p>}
              {order.nail_shape && <p><span className="text-muted-foreground">Shape:</span> {order.nail_shape}</p>}
              {order.color_preference && <p><span className="text-muted-foreground">Colour:</span> {order.color_preference}</p>}
            </div>
          )}

          {/* Tracking */}
          {order.tracking_number && (
            <div className="flex items-center justify-between text-sm p-3 rounded-xl bg-purple-50 border border-purple-100">
              <div>
                <p className="font-semibold text-purple-900 text-xs uppercase tracking-wide">Tracking Number</p>
                <p className="font-mono font-semibold text-purple-800 mt-0.5">{order.tracking_number}</p>
              </div>
              <Truck className="w-5 h-5 text-purple-400" />
            </div>
          )}

          {/* Shipping address */}
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

const Orders = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    supabase
      .from('orders')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setOrders((data ?? []) as Order[]);
        setLoading(false);
      });
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
    <>
      <Helmet><title>My Orders | Nail Shingaar by Reet</title></Helmet>
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
                <Link to="/shop">Shop Now <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => <OrderCard key={order.id} order={order} />)}
            </div>
          )}
        </div>
      </Layout>
    </>
  );
};

export default Orders;
