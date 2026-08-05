export const isProductInStock = (productVariant?: {
  manage_inventory?: boolean | null;
  allow_backorder?: boolean | null;
  inventory_quantity?: number | null;
} | null) => {
  if (!productVariant) {
    return true;
  }

  if (!productVariant.manage_inventory) {
    return true;
  }

  if (productVariant.allow_backorder) {
    return true;
  }

  // If manage_inventory is true and allow_backorder is not true:
  // If inventory_quantity is explicitly 0, null, or a number <= 0, return false (out of stock)
  if (
    productVariant.manage_inventory &&
    (productVariant.inventory_quantity === 0 ||
      productVariant.inventory_quantity === null ||
      (typeof productVariant.inventory_quantity === "number" && productVariant.inventory_quantity <= 0))
  ) {
    return false;
  }

  return true;
};
