/**
 * Sorts products by an optional `metadata.sort_order` field (admin-configurable
 * display order), falling back to original array order for unranked products.
 *
 * - `metadata.sort_order` may arrive as a number or a numeric string (admin form
 *   input). It is coerced with `Number(...)` and treated as "ranked" only when
 *   `Number.isFinite(...)` is true after coercion. `null`, `undefined`, an empty
 *   string, and `NaN` are all treated as "no rank".
 * - Ranked products are sorted ascending by `sort_order`; ties preserve original
 *   relative order (stable).
 * - Unranked products come after all ranked products, and preserve their
 *   original relative order among themselves (stable).
 * - Pure: does not mutate the input array or its elements.
 */
export function sortProductsByDisplayOrder<
  T extends { metadata?: Record<string, unknown> | null },
>(products: T[]): T[] {
  const parseSortOrder = (metadata: T["metadata"]): number | null => {
    const raw = metadata?.sort_order;
    if (raw === null || raw === undefined || raw === "") return null;
    const coerced = Number(raw);
    return Number.isFinite(coerced) ? coerced : null;
  };

  return products
    .map((product, index) => ({
      product,
      index,
      sortOrder: parseSortOrder(product.metadata),
    }))
    .sort((a, b) => {
      const aRanked = a.sortOrder !== null;
      const bRanked = b.sortOrder !== null;

      if (aRanked && bRanked) {
        if (a.sortOrder !== b.sortOrder) {
          return (a.sortOrder as number) - (b.sortOrder as number);
        }
        return a.index - b.index;
      }

      if (aRanked !== bRanked) {
        // Ranked entries sort before unranked entries.
        return aRanked ? -1 : 1;
      }

      // Both unranked: preserve original relative order.
      return a.index - b.index;
    })
    .map((entry) => entry.product);
}
