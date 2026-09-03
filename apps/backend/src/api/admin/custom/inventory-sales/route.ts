import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import {
  aggregateInventorySales,
  mapInventoryItemToRow,
  mapOrdersToSales,
} from "../../../../utils/inventory-sales";

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);
  const { category_id, weight, date_from, date_to } = req.query as Record<
    string,
    string | undefined
  >;

  const { data: inventoryItems } = await query.graph({
    entity: "inventory_item",
    fields: [
      "id",
      "sku",
      "title",
      "reserved_quantity",
      "stocked_quantity",
      "variants.title",
      "variants.product.title",
      "variants.product.categories.id",
      "variants.product.categories.name",
    ],
    pagination: { take: 1000 },
  });

  const items = (inventoryItems as any[]).map(mapInventoryItemToRow);

  const orderFilters: Record<string, unknown> = {};
  if (date_from || date_to) {
    orderFilters.created_at = {
      ...(date_from ? { $gte: date_from } : {}),
      ...(date_to ? { $lte: date_to } : {}),
    };
  }

  const { data: orders } = await query.graph({
    entity: "order",
    fields: ["id", "items.variant_sku", "items.detail.shipped_quantity"],
    filters: orderFilters,
    pagination: { take: 1000 },
  });

  const sales = mapOrdersToSales(orders as any[]);

  const { rows, totals } = aggregateInventorySales(items, sales, {
    categoryId: category_id,
    weight,
  });

  res.json({ rows, totals, count: rows.length });
}
