// Server only: holds the Razorpay secret and the Supabase service-role key.

import { createHmac, timingSafeEqual } from 'node:crypto';
import { NextResponse } from 'next/server';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';
import { isCustomDesignOrder, shippingFor } from '@/lib/pricing';

type OrderRow = Database['public']['Tables']['orders']['Row'];

export class PaymentError extends Error {
  constructor(message: string, readonly status = 400) {
    super(message);
  }
}

export function errorResponse(err: unknown) {
  if (err instanceof PaymentError) return NextResponse.json({ error: err.message }, { status: err.status });
  console.error('[razorpay]', err);
  return NextResponse.json({ error: 'Something went wrong, please try again' }, { status: 500 });
}

function env(name: string): string {
  const value = process.env[name];
  if (!value) throw new PaymentError(`Online payments are not configured (${name} missing)`, 503);
  return value;
}

// ── Supabase (service role: bypasses RLS, server only) ──────────────────────

let admin: SupabaseClient<Database> | null = null;

export function adminDb(): SupabaseClient<Database> {
  admin ??= createClient<Database>(env('NEXT_PUBLIC_SUPABASE_URL'), env('SUPABASE_SERVICE_ROLE_KEY'), {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return admin;
}

/** The signed-in customer, from the `Authorization: Bearer <supabase access token>` header. */
export async function requireUser(req: Request) {
  const token = req.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
  if (!token) throw new PaymentError('Please sign in again', 401);
  const { data, error } = await adminDb().auth.getUser(token);
  if (error || !data.user) throw new PaymentError('Please sign in again', 401);
  return data.user;
}

export async function loadOwnOrder(orderId: unknown, userId: string): Promise<OrderRow> {
  if (typeof orderId !== 'string' || !/^[0-9a-f-]{36}$/i.test(orderId)) throw new PaymentError('Invalid order');
  const { data, error } = await adminDb().from('orders').select('*').eq('id', orderId).maybeSingle();
  if (error) throw new PaymentError('Could not load order', 500);
  if (!data || data.user_id !== userId) throw new PaymentError('Order not found', 404);
  return data;
}

// ── Pricing: never trust the total the browser wrote ────────────────────────

/** Amount to charge in rupees, recomputed from the database. */
export async function amountDue(order: OrderRow): Promise<number> {
  if (isCustomDesignOrder(order)) {
    // Priced by Reet's quote in admin; customers can't edit it (DB trigger).
    if (!(order.total > 0)) throw new PaymentError('Reet hasn’t quoted a price for this design yet', 409);
    return order.total;
  }

  const db = adminDb();
  const { data: items, error } = await db.from('order_items').select('product_id, quantity').eq('order_id', order.id);
  if (error) throw new PaymentError('Could not load order items', 500);
  if (!items?.length) throw new PaymentError('This order has no items', 409);

  for (const i of items) {
    if (!i.product_id || !Number.isInteger(i.quantity) || i.quantity < 1 || i.quantity > 50) {
      throw new PaymentError('This order has an invalid item', 409);
    }
  }
  const ids = [...new Set(items.map((i) => i.product_id as string))];
  const { data: products, error: pErr } = await db.from('products').select('id, price').in('id', ids);
  if (pErr) throw new PaymentError('Could not load prices', 500);
  const price = new Map((products ?? []).map((p) => [p.id, Number(p.price)]));

  let subtotal = 0;
  for (const i of items) {
    const p = price.get(i.product_id as string);
    if (p === undefined) throw new PaymentError('A product in this order is no longer available', 409);
    subtotal += p * i.quantity;
  }
  return subtotal + shippingFor(subtotal);
}

// ── Razorpay REST API ───────────────────────────────────────────────────────

export const razorpayKeyId = () => env('NEXT_PUBLIC_RAZORPAY_KEY_ID');

async function razorpay<T>(path: string, init?: { method?: string; body?: unknown }): Promise<T> {
  const auth = Buffer.from(`${razorpayKeyId()}:${env('RAZORPAY_KEY_SECRET')}`).toString('base64');
  const res = await fetch(`https://api.razorpay.com/v1${path}`, {
    method: init?.method ?? 'GET',
    headers: { Authorization: `Basic ${auth}`, 'Content-Type': 'application/json' },
    body: init?.body ? JSON.stringify(init.body) : undefined,
    cache: 'no-store',
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    console.error('[razorpay]', path, res.status, json?.error?.description);
    throw new PaymentError('Payment provider error, please try again', 502);
  }
  return json as T;
}

export type RzpOrder = { id: string; amount: number; currency: string; status: string; notes?: { order_id?: string } };
export type RzpPayment = { id: string; order_id: string; amount: number; currency: string; status: string };

export const createRzpOrder = (amountPaise: number, orderId: string) =>
  razorpay<RzpOrder>('/orders', {
    method: 'POST',
    body: { amount: amountPaise, currency: 'INR', receipt: orderId, notes: { order_id: orderId } },
  });

export const fetchRzpOrder = (id: string) => razorpay<RzpOrder>(`/orders/${encodeURIComponent(id)}`);
export const fetchRzpPayment = (id: string) => razorpay<RzpPayment>(`/payments/${encodeURIComponent(id)}`);
export const captureRzpPayment = (p: RzpPayment) =>
  razorpay<RzpPayment>(`/payments/${encodeURIComponent(p.id)}/capture`, {
    method: 'POST',
    body: { amount: p.amount, currency: p.currency },
  });

// ── Signatures ──────────────────────────────────────────────────────────────

function safeEqualHex(expected: string, given: string): boolean {
  const a = Buffer.from(expected, 'utf8');
  const b = Buffer.from(given, 'utf8');
  return a.length === b.length && timingSafeEqual(a, b);
}

/** Checkout handler signature: HMAC-SHA256(order_id|payment_id, key_secret). */
export function checkoutSignatureValid(rzpOrderId: string, paymentId: string, signature: string): boolean {
  const expected = createHmac('sha256', env('RAZORPAY_KEY_SECRET')).update(`${rzpOrderId}|${paymentId}`).digest('hex');
  return safeEqualHex(expected, signature);
}

/** Webhook signature: HMAC-SHA256(raw body, webhook secret). */
export function webhookSignatureValid(rawBody: string, signature: string): boolean {
  const expected = createHmac('sha256', env('RAZORPAY_WEBHOOK_SECRET')).update(rawBody).digest('hex');
  return safeEqualHex(expected, signature);
}

// ── Settlement ──────────────────────────────────────────────────────────────

/**
 * Confirms a Razorpay payment against our order and marks it paid. Safe to call
 * more than once (browser callback and webhook can both arrive). Accepts a
 * payment on any Razorpay order we created for this order, so a late payment
 * on an earlier attempt is still recorded.
 */
export async function settlePayment(order: OrderRow, paymentId: string): Promise<'paid' | 'pending'> {
  if (order.payment_status === 'confirmed') return 'paid';

  let payment = await fetchRzpPayment(paymentId);
  const rzpOrder = await fetchRzpOrder(payment.order_id);
  if (rzpOrder.notes?.order_id !== order.id || payment.amount !== rzpOrder.amount || payment.currency !== 'INR') {
    throw new PaymentError('Payment does not match this order', 400);
  }
  if (payment.status === 'authorized') payment = await captureRzpPayment(payment);
  if (payment.status !== 'captured') return 'pending';

  const { error } = await adminDb()
    .from('orders')
    .update({
      payment_status: 'confirmed',
      razorpay_order_id: rzpOrder.id,
      razorpay_payment_id: payment.id,
      total: rzpOrder.amount / 100,
      paid_at: new Date().toISOString(),
      // Move a fresh order forward; never pull back one Reet has already progressed.
      ...(order.status === 'pending' ? { status: 'confirmed' as const } : {}),
    })
    .eq('id', order.id)
    .neq('payment_status', 'confirmed');
  if (error) throw new PaymentError('Could not record payment', 500);
  return 'paid';
}
