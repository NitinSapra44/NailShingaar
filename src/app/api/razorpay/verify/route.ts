import { NextResponse } from 'next/server';
import {
  PaymentError, checkoutSignatureValid, errorResponse, loadOwnOrder, requireUser, settlePayment,
} from '@/lib/razorpay-server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// POST { orderId, razorpay_order_id, razorpay_payment_id, razorpay_signature }
// from the Checkout success handler.
export async function POST(req: Request) {
  try {
    const user = await requireUser(req);
    const body = await req.json().catch(() => ({}));
    const { orderId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = body as Record<string, unknown>;
    if (typeof razorpay_order_id !== 'string' || typeof razorpay_payment_id !== 'string' || typeof razorpay_signature !== 'string') {
      throw new PaymentError('Invalid payment response');
    }

    const order = await loadOwnOrder(orderId, user.id);
    if (!checkoutSignatureValid(razorpay_order_id, razorpay_payment_id, razorpay_signature)) {
      throw new PaymentError('Payment could not be verified');
    }

    // settlePayment re-checks with Razorpay that this payment belongs to this order.
    const status = await settlePayment(order, razorpay_payment_id);
    return NextResponse.json({ status });
  } catch (err) {
    return errorResponse(err);
  }
}
