export type ShippingDisplay =
  | { kind: "pending" }
  | { kind: "free" }
  | { kind: "amount"; amount: number };

/**
 * `shipping_total` is 0 both when shipping is genuinely free and when no
 * shipping method has been picked yet, so the method list decides which.
 */
export function getShippingDisplay(cart: {
  shipping_methods?: unknown[] | null;
  shipping_total?: number | null;
}): ShippingDisplay {
  if (!cart.shipping_methods?.length) {
    return { kind: "pending" };
  }

  const total = cart.shipping_total ?? 0;

  return total === 0 ? { kind: "free" } : { kind: "amount", amount: total };
}
