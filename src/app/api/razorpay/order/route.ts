import { NextResponse } from 'next/server';
import {
  PaymentError, adminDb, amountDue, createRzpOrder, errorResponse, fetchRzpOrder, loadOwnOrder, razorpayKeyId,
  requireUser, type RzpOrder,
} from '@/lib/razorpay-server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// POST { orderId } → a Razorpay order for the amount the database says is due.
export async function POST(req: Request) {
  try {
    const user = await requireUser(req);
    const { orderId } = await req.json().catch(() => ({}));
    const order = await loadOwnOrder(orderId, user.id);
    if (order.payment_status === 'confirmed') throw new PaymentError('This order is already paid', 409);

    const amount = await amountDue(order);
    const paise = Math.round(amount * 100);
    if (paise < 100) throw new PaymentError('Order total is below the ₹1 minimum for online payment', 400);

    // Retry of an earlier attempt: keep the same Razorpay order while the amount
    // is unchanged, so a payment that lands late on it still matches.
    let rzp: RzpOrder | null = null;
    if (order.razorpay_order_id) {
      const prev = await fetchRzpOrder(order.razorpay_order_id);
      if (prev.status === 'paid') throw new PaymentError('Payment already received, confirming your order', 409);
      if (prev.amount === paise) rzp = prev;
    }
    rzp ??= await createRzpOrder(paise, order.id);

    const { error } = await adminDb()
      .from('orders')
      .update({ razorpay_order_id: rzp.id, total: amount })
      .eq('id', order.id);
    if (error) throw new PaymentError('Could not start payment', 500);

    return NextResponse.json({ keyId: razorpayKeyId(), razorpayOrderId: rzp.id, amount: rzp.amount, currency: rzp.currency });
  } catch (err) {
    return errorResponse(err);
  }
}

