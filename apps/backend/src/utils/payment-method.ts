const PROVIDER_LABELS: Record<string, string> = {
  paypal: "PayPal",
  "bank-transfer": "Bank transfer",
  system: "Manual",
  manual: "Manual",
};

/**
 * Turns a Medusa payment provider id ("pp_paypal_paypal", "pp_system_default")
 * into something readable in the admin.
 */
export function formatPaymentMethod(providerId?: string | null): string {
  const raw = providerId?.trim();

  if (!raw) {
    return "—";
  }

  // Provider ids are "pp_<provider>_<id>"; the provider part is what matters.
  const withoutPrefix = raw.replace(/^pp_/, "");

  for (const [key, label] of Object.entries(PROVIDER_LABELS)) {
    if (withoutPrefix === key || withoutPrefix.startsWith(`${key}_`)) {
      return label;
    }
  }

  return withoutPrefix
    .split(/[_-]/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

/**
 * An order can hold several payments; list each distinct method once.
 */
export function collectPaymentMethods(
  paymentCollections?: Array<{
    payments?: Array<{ provider_id?: string | null }> | null;
  }> | null
): string {
  const labels = new Set<string>();

  for (const collection of paymentCollections ?? []) {
    for (const payment of collection.payments ?? []) {
      const label = formatPaymentMethod(payment.provider_id);
      if (label !== "—") {
        labels.add(label);
      }
    }
  }

  return labels.size ? Array.from(labels).join(", ") : "—";
}
