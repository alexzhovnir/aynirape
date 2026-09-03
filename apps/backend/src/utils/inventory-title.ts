const PLACEHOLDER_VARIANT_TITLES = new Set(["default", "default variant"]);

/**
 * Inventory items are created with just the variant title ("20g", "Default"),
 * which is ambiguous in the inventory list. Prefix it with the product name.
 */
export function buildInventoryItemTitle(
  productTitle?: string | null,
  variantTitle?: string | null
): string | null {
  const product = productTitle?.trim();
  const variant = variantTitle?.trim();

  if (!product) {
    return variant || null;
  }

  if (!variant || PLACEHOLDER_VARIANT_TITLES.has(variant.toLowerCase())) {
    return product;
  }

  return `${product} — ${variant}`;
}

export type VariantOption = {
  value?: string | null;
  option?: { title?: string | null } | null;
};

/**
 * Renders a variant's options ("Weight: 20g · Color: Red") for display.
 */
export function formatVariantOptions(options?: VariantOption[] | null): string {
  if (!options?.length) {
    return "";
  }

  return options
    .map((option) => {
      const value = option.value?.trim();
      if (!value) {
        return null;
      }

      const label = option.option?.title?.trim();
      return label ? `${label}: ${value}` : value;
    })
    .filter((part): part is string => Boolean(part))
    .join(" · ");
}
