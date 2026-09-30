/**
 * Razorpay Checkout (browser side).
 *
 * Online payments switch on when NEXT_PUBLIC_RAZORPAY_KEY_ID is set; until then
 * checkout keeps the manual UPI-screenshot flow. Amounts are always decided by
 * the server (/api/razorpay/order), never by this file.
 */
import { supabase } from '@/integrations/supabase/client';

const RAZORPAY_KEY_ID = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ?? '';

type SuccessResponse = { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string };

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => {
      open(): void;
      on(event: 'payment.failed', handler: (response: { error: { description?: string } }) => void): void;
    };
  }
}

export function isRazorpayEnabled(): boolean {
  return !!RAZORPAY_KEY_ID;
}

export type PaymentResult =
  | { status: 'paid' }
  /** Money taken but not yet confirmed (e.g. network drop); the webhook will settle it. */
  | { status: 'processing' }
  | { status: 'dismissed' };

async function api<T>(path: string, body: unknown): Promise<T> {
  const { data } = await supabase.auth.getSession();
  const res = await fetch(path, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(data.session ? { Authorization: `Bearer ${data.session.access_token}` } : {}),
    },
    body: JSON.stringify(body),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error ?? 'Payment failed, please try again');
  return json as T;
}

/** Opens Razorpay for an existing order and resolves once it is paid or the customer closes it. */
export async function payForOrder(opts: {
  orderId: string;
  description: string;
  prefill: { name?: string; email?: string; contact?: string };
  /** A payment attempt failed (declined card, cancelled UPI…). The modal stays open so they can retry. */
  onFailed?: (reason: string) => void;
}): Promise<PaymentResult> {
  const [start] = await Promise.all([
    api<{ keyId: string; razorpayOrderId: string; amount: number; currency: string }>(
      '/api/razorpay/order',
      { orderId: opts.orderId },
    ),
    loadRazorpayScript(),
  ]);

  return new Promise<PaymentResult>((resolve, reject) => {
    const rzp = new window.Razorpay({
      key: start.keyId,
      order_id: start.razorpayOrderId,
      amount: start.amount,
      currency: start.currency,
      name: 'Nail Shingaar by Reet',
      description: opts.description,
      image: `${window.location.origin}/apple-icon.png`,
      prefill: opts.prefill,
      notes: { order_id: opts.orderId },
      theme: { color: '#171412' },
      handler: async (response: SuccessResponse) => {
        try {
          const { status } = await api<{ status: 'paid' | 'pending' }>('/api/razorpay/verify', {
            orderId: opts.orderId,
            ...response,
          });
          resolve({ status: status === 'paid' ? 'paid' : 'processing' });
        } catch (err) {
          // Razorpay has the money; don't make the customer pay twice.
          console.error('[razorpay] verify failed', err);
          resolve({ status: 'processing' });
        }
      },
      modal: {
        ondismiss: () => resolve({ status: 'dismissed' }),
        confirm_close: true,
      },
      retry: { enabled: true },
    });
    rzp.on('payment.failed', (response) => {
      opts.onFailed?.(response.error?.description || 'Payment failed. Please try again or use another method.');
    });
    try {
      rzp.open();
    } catch (err) {
      reject(err);
    }
  });
}

let scriptPromise: Promise<void> | null = null;

function loadRazorpayScript(): Promise<void> {
  if (typeof window !== 'undefined' && window.Razorpay) return Promise.resolve();
  scriptPromise ??= new Promise<void>((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => {
      scriptPromise = null;
      script.remove();
      reject(new Error('Could not load the payment window. Check your connection and try again.'));
    };
    document.head.appendChild(script);
  });
  return scriptPromise;
}
