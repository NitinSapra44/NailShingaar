/**
 * Shiprocket integration — DISABLED
 * Set VITE_SHIPROCKET_EMAIL and VITE_SHIPROCKET_PASSWORD in .env to activate.
 *
 * All API calls should go through a Supabase Edge Function (never expose
 * credentials client-side). This file documents the intended flow.
 *
 * Flow:
 *  1. Admin confirms order → call createShiprocketOrder() via Edge Function
 *  2. Shiprocket creates a shipment and returns AWB tracking number
 *  3. Save AWB to orders.tracking_number
 *  4. Customer sees tracking on OrderConfirmation page
 */

const SHIPROCKET_ENABLED = false;

export function isShiprocketEnabled(): boolean {
  return SHIPROCKET_ENABLED;
}

export interface ShiprocketOrderPayload {
  orderId: string;
  orderDate: string;
  customerName: string;
  customerPhone: string;
  shippingAddress: string;
  shippingCity: string;
  shippingPincode: string;
  items: { name: string; sku: string; units: number; sellingPrice: number }[];
  total: number;
}

/**
 * Stub — replace body with actual Edge Function call when Shiprocket is enabled.
 * The Edge Function should authenticate with Shiprocket, create the order,
 * and return the AWB number.
 */
export async function createShiprocketOrder(payload: ShiprocketOrderPayload): Promise<string | null> {
  if (!isShiprocketEnabled()) {
    console.warn('[Shiprocket] Integration disabled. Enable SHIPROCKET_ENABLED to activate.');
    return null;
  }

  // TODO: Call your Supabase Edge Function
  // const { data, error } = await supabase.functions.invoke('create-shiprocket-order', { body: payload });
  // if (error) throw error;
  // return data.awb_number;

  console.log('[Shiprocket] Would create order for payload:', payload);
  return null;
}

export async function trackShiprocketShipment(awbNumber: string): Promise<string | null> {
  if (!isShiprocketEnabled()) return null;

  // TODO: Call your Supabase Edge Function for tracking
  // const { data, error } = await supabase.functions.invoke('track-shiprocket-shipment', { body: { awb: awbNumber } });

  console.log('[Shiprocket] Would track AWB:', awbNumber);
  return null;
}
