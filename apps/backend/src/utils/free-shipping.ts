/**
 * Order subtotal (in the cart's currency major unit) at or above which the
 * free standard shipping option is offered instead of the paid one.
 */
export const FREE_SHIPPING_THRESHOLD = 150;

export const FREE_SHIPPING_RULE_ATTRIBUTE = "free_shipping_eligible";

export function isFreeShippingEligible(itemTotal?: number | string | null): boolean {
  if (itemTotal === null || itemTotal === undefined || itemTotal === "") {
    return false;
  }

  const total = Number(itemTotal);

  if (!Number.isFinite(total)) {
    return false;
  }

  return total >= FREE_SHIPPING_THRESHOLD;
}

export function buildFreeShippingContext(cart?: {
  item_total?: number | string | null;
}): Record<string, string> {
  return {
    [FREE_SHIPPING_RULE_ATTRIBUTE]: isFreeShippingEligible(cart?.item_total)
      ? "true"
      : "false",
  };
}
