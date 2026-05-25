/**
 * Razorpay integration — DISABLED
 * Set VITE_RAZORPAY_KEY_ID in .env and flip RAZORPAY_ENABLED to activate.
 *
 * When enabled:
 *  - Call createRazorpayOrder() from a Supabase Edge Function to get an order_id
 *  - Call openRazorpayCheckout() on the client to show the payment modal
 *  - Verify the payment server-side using the signature
 */

const RAZORPAY_ENABLED = false;
const RAZORPAY_KEY_ID = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ?? '';

export interface RazorpayOptions {
  amount: number;       // in paise (₹ × 100)
  currency: string;
  orderId: string;      // from Razorpay Orders API
  name: string;
  description: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  onSuccess: (response: { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string }) => void;
  onDismiss?: () => void;
}

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Razorpay: new (options: Record<string, unknown>) => { open(): void };
  }
}

export function isRazorpayEnabled(): boolean {
  return RAZORPAY_ENABLED && !!RAZORPAY_KEY_ID;
}

export async function openRazorpayCheckout(opts: RazorpayOptions): Promise<void> {
  if (!isRazorpayEnabled()) {
    console.warn('[Razorpay] Integration is disabled. Enable VITE_RAZORPAY_KEY_ID and set RAZORPAY_ENABLED=true.');
    return;
  }

  // Lazy-load the Razorpay SDK
  await loadRazorpayScript();

  const rzp = new window.Razorpay({
    key: RAZORPAY_KEY_ID,
    amount: opts.amount,
    currency: opts.currency ?? 'INR',
    name: 'Nail Shingaar by Reet',
    description: opts.description,
    order_id: opts.orderId,
    handler: opts.onSuccess,
    prefill: {
      name: opts.customerName,
      email: opts.customerEmail,
      contact: opts.customerPhone,
    },
    theme: { color: 'hsl(15, 42%, 57%)' },
    modal: { ondismiss: opts.onDismiss },
  });

  rzp.open();
}

function loadRazorpayScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector('script[src*="razorpay"]')) { resolve(); return; }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Razorpay SDK'));
    document.head.appendChild(script);
  });
}
