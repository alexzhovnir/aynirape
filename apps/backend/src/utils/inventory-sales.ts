export type InventoryItemRow = {
  id: string;
  sku: string | null;
  title: string | null;
  reserved_quantity: number;
  stocked_quantity: number;
  weight: string | null;
  product_title: string | null;
  category_id: string | null;
  category_name: string | null;
};

export type LineItemSale = {
  variant_sku: string | null;
  shipped_quantity: number;
};

export type InventorySalesFilters = {
  categoryId?: string;
  weight?: string;
};

export type InventorySalesRow = InventoryItemRow & { sold_quantity: number };

export type InventorySalesTotals = {
  reserved: number;
  stocked: number;
  sold: number;
};

export type RawInventoryItem = {
  id: string;
  sku?: string | null;
  title?: string | null;
  reserved_quantity?: number | null;
  stocked_quantity?: number | null;
  variants?: Array<{
    title?: string | null;
    product?: {
      title?: string | null;
      categories?: Array<{ id?: string | null; name?: string | null }> | null;
    } | null;
  }> | null;
};

export function mapInventoryItemToRow(item: RawInventoryItem): InventoryItemRow {
  const variant = item.variants?.[0];
  const category = variant?.product?.categories?.[0];

  return {
    id: item.id,
    sku: item.sku ?? null,
    title: item.title ?? null,
    reserved_quantity: item.reserved_quantity ?? 0,
    stocked_quantity: item.stocked_quantity ?? 0,
    weight: variant?.title ?? null,
    product_title: variant?.product?.title ?? null,
    category_id: category?.id ?? null,
    category_name: category?.name ?? null,
  };
}

export type RawOrderWithLineItems = {
  items?: Array<{
    variant_sku?: string | null;
    detail?: { shipped_quantity?: number | null } | null;
  }> | null;
};

export function mapOrdersToSales(orders: RawOrderWithLineItems[]): LineItemSale[] {
  return orders.flatMap((order) =>
    (order.items ?? []).map((item) => ({
      variant_sku: item.variant_sku ?? null,
      shipped_quantity: item.detail?.shipped_quantity ?? 0,
    }))
  );
}

export function aggregateInventorySales(
  items: InventoryItemRow[],
  sales: LineItemSale[],
  filters: InventorySalesFilters = {}
): { rows: InventorySalesRow[]; totals: InventorySalesTotals } {
  const soldBySku = new Map<string, number>();

  for (const sale of sales) {
    if (!sale.variant_sku) {
      continue;
    }
    soldBySku.set(
      sale.variant_sku,
      (soldBySku.get(sale.variant_sku) ?? 0) + sale.shipped_quantity
    );
  }

  const rows = items
    .filter((item) => !filters.categoryId || item.category_id === filters.categoryId)
    .filter((item) => !filters.weight || item.weight === filters.weight)
    .map((item) => ({
      ...item,
      sold_quantity: (item.sku && soldBySku.get(item.sku)) || 0,
    }));

  const totals = rows.reduce<InventorySalesTotals>(
    (acc, row) => {
      acc.reserved += row.reserved_quantity;
      acc.stocked += row.stocked_quantity;
      acc.sold += row.sold_quantity;
      return acc;
    },
    { reserved: 0, stocked: 0, sold: 0 }
  );

  return { rows, totals };
}
