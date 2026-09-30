import { NextResponse } from 'next/server';
import { adminDb, errorResponse, fetchRzpOrder, settlePayment, webhookSignatureValid } from '@/lib/razorpay-server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Razorpay → us, server to server. Catches payments where the customer closed
// the tab before the browser could call /verify.
// Dashboard → Settings → Webhooks: URL <site>/api/razorpay/webhook,
// events payment.captured + order.paid, secret = RAZORPAY_WEBHOOK_SECRET.
export async function POST(req: Request) {
  try {
    const raw = await req.text();
    const signature = req.headers.get('x-razorpay-signature') ?? '';
    if (!webhookSignatureValid(raw, signature)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    const event = JSON.parse(raw) as {
      event: string;
      payload?: { payment?: { entity?: { id: string; order_id: string } } };
    };
    const payment = event.payload?.payment?.entity;
    if (!['payment.captured', 'order.paid'].includes(event.event) || !payment?.order_id) {
      return NextResponse.json({ ok: true, ignored: event.event });
    }

    // Our order id travels in the Razorpay order's notes (set when payment started).
    const ourId = (await fetchRzpOrder(payment.order_id)).notes?.order_id;
    const { data: order } = ourId
      ? await adminDb().from('orders').select('*').eq('id', ourId).maybeSingle()
      : { data: null };
    // Not one of ours: acknowledge so Razorpay stops retrying.
    if (!order) return NextResponse.json({ ok: true, ignored: 'unknown order' });

    const status = await settlePayment(order, payment.id);
    return NextResponse.json({ ok: true, status });
  } catch (err) {
    // Non-2xx makes Razorpay retry later, which is what we want for transient errors.
    return errorResponse(err);
  }
}
