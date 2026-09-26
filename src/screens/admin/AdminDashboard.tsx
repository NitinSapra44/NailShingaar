'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/integrations/supabase/client';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Package, FolderOpen, ShoppingCart, AlertCircle, CheckCircle2, Clock, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';
import type { Order, PaymentStatus, OrderStatus } from '@/types';

const statusColor: Record<OrderStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  shipped: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

const paymentColor: Record<PaymentStatus, string> = {
  pending: 'bg-gray-100 text-gray-600',
  screenshot_uploaded: 'bg-orange-100 text-orange-700',
  confirmed: 'bg-green-100 text-green-700',
  failed: 'bg-red-100 text-red-700',
};

export const AdminDashboard = () => {
  const [stats, setStats] = useState({ products: 0, categories: 0, orders: 0, revenue: 0 });
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [awaitingPayment, setAwaitingPayment] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    const [productsRes, categoriesRes, ordersRes, recentRes] = await Promise.all([
      supabase.from('products').select('id', { count: 'exact', head: true }),
      supabase.from('categories').select('id', { count: 'exact', head: true }),
      supabase.from('orders').select('total'),
      supabase.from('orders').select('*').order('created_at', { ascending: false }).limit(8),
    ]);

    const allOrders = (ordersRes.data ?? []) as Order[];
    const revenue = allOrders.reduce((sum, o) => sum + Number(o.total), 0);

    const recent = (recentRes.data ?? []) as Order[];
    setRecentOrders(recent);
    setAwaitingPayment(recent.filter((o) => o.payment_status === 'screenshot_uploaded'));
    setStats({
      products: productsRes.count || 0,
      categories: categoriesRes.count || 0,
      orders: ordersRes.data?.length || 0,
      revenue,
    });
    setLoading(false);
  };

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="font-display text-3xl font-semibold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Welcome back, Reet ✦</p>
        </div>

        {/* Urgent: payment screenshots waiting */}
        {awaitingPayment.length > 0 && (
          <div className="flex items-start gap-3 px-5 py-4 bg-orange-50 border border-orange-200 rounded-2xl">
            <AlertCircle className="h-5 w-5 text-orange-500 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-orange-900 font-semibold text-sm">
                {awaitingPayment.length} order{awaitingPayment.length > 1 ? 's' : ''} need payment confirmation
              </p>
              <p className="text-orange-700 text-xs mt-0.5">
                Customers have uploaded payment screenshots — review and confirm.
              </p>
            </div>
            <Button asChild size="sm" className="rounded-full bg-orange-500 hover:bg-orange-600 text-white shrink-0">
              <Link href="/admin/orders">Review Orders</Link>
            </Button>
          </div>
        )}

        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Orders', value: stats.orders, icon: ShoppingCart, sub: 'all time' },
            { label: 'Revenue', value: `₹${stats.revenue.toLocaleString('en-IN')}`, icon: TrendingUp, sub: 'all time' },
            { label: 'Products', value: stats.products, icon: Package, sub: 'listed' },
            { label: 'Categories', value: stats.categories, icon: FolderOpen, sub: 'active' },
          ].map((s) => (
            <Card key={s.label} className="rounded-2xl shadow-soft border-border">
              <CardHeader className="flex flex-row items-center justify-between pb-2 pt-5 px-5">
                <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{s.label}</CardTitle>
                <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
                  <s.icon className="w-4 h-4 text-primary" />
                </div>
              </CardHeader>
              <CardContent className="px-5 pb-5">
                <p className="font-display text-3xl font-semibold text-foreground">{s.value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{s.sub}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent orders */}
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold">Recent Orders</h2>
              <Link href="/admin/orders" className="text-xs text-primary hover:underline">View all →</Link>
            </div>

            {loading && (
              <div className="space-y-3">
                {[1,2,3].map((n) => <div key={n} className="h-20 rounded-2xl bg-muted animate-pulse" />)}
              </div>
            )}

            {!loading && recentOrders.length === 0 && (
              <div className="text-center py-12 text-muted-foreground text-sm rounded-2xl border border-dashed border-border">
                No orders yet. Share your shop link to get started!
              </div>
            )}

            {!loading && recentOrders.map((order) => (
              <Link href="/admin/orders" key={order.id}>
                <div className={`flex items-center gap-4 p-4 rounded-2xl border transition-all hover:shadow-soft cursor-pointer ${
                  order.payment_status === 'screenshot_uploaded' ? 'bg-orange-50 border-orange-200' : 'bg-card border-border'
                }`}>
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    {order.payment_status === 'screenshot_uploaded' && <Clock className="w-5 h-5 text-orange-500" />}
                    {order.payment_status === 'confirmed' && <CheckCircle2 className="w-5 h-5 text-green-500" />}
                    {order.payment_status !== 'screenshot_uploaded' && order.payment_status !== 'confirmed' && <ShoppingCart className="w-5 h-5 text-primary" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-foreground truncate">{order.shipping_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {order.shipping_city} · {format(new Date(order.created_at), 'dd MMM yyyy')}
                    </p>
                  </div>
                  <div className="text-right shrink-0 space-y-1">
                    <p className="font-semibold text-sm">₹{Number(order.total).toLocaleString('en-IN')}</p>
                    <Badge className={`text-xs ${statusColor[order.status] ?? 'bg-gray-100 text-gray-700'}`}>
                      {order.status}
                    </Badge>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Quick links */}
          <div className="space-y-3">
            <h2 className="font-display text-lg font-semibold">Quick Actions</h2>
            <div className="space-y-2">
              {[
                { label: 'Add New Product', href: '/admin/products', icon: Package, desc: 'List a new nail set' },
                { label: 'Manage Categories', href: '/admin/categories', icon: FolderOpen, desc: 'Edit collections' },
                { label: 'View All Orders', href: '/admin/orders', icon: ShoppingCart, desc: 'Update delivery status' },
              ].map((a) => (
                <Link href={a.href} key={a.href}>
                  <div className="flex items-center gap-3 p-4 rounded-2xl bg-card border border-border hover:shadow-soft hover:border-primary/30 transition-all">
                    <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <a.icon className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{a.label}</p>
                      <p className="text-xs text-muted-foreground">{a.desc}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Payment status summary */}
            <div className="mt-4 p-4 rounded-2xl bg-gradient-card border border-border space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Payment Status</p>
              {(['pending', 'screenshot_uploaded', 'confirmed'] as PaymentStatus[]).map((status) => {
                const count = recentOrders.filter((o) => o.payment_status === status).length;
                return (
                  <div key={status} className="flex items-center justify-between">
                    <Badge className={`text-xs ${paymentColor[status]}`}>
                      {status === 'screenshot_uploaded' ? 'Screenshot received' : status}
                    </Badge>
                    <span className="text-sm font-semibold">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};
