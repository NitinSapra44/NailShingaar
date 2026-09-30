// Shared by the checkout UI and the payment server so both charge the same amount.

export const FREE_SHIPPING_THRESHOLD = 999;
export const SHIPPING_FEE = 99;

export function shippingFor(subtotal: number): number {
  return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
}

/** Custom-design enquiries carry `{"type":"custom_design"}` in `orders.notes`. */
export function isCustomDesignOrder(order: { notes: string | null }): boolean {
  try {
    return JSON.parse(order.notes ?? '{}').type === 'custom_design';
  } catch {
    return false;
  }
}
