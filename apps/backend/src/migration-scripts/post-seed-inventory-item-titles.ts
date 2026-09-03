import type { ExecArgs } from "@medusajs/framework/types";
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils";
import { buildInventoryItemTitle } from "../utils/inventory-title";

/**
 * Renames inventory items from the bare variant title ("20g", "Default") to
 * "<Product> — <variant>" so the inventory list identifies the product.
 */
export default async function inventoryItemTitles({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const query = container.resolve(ContainerRegistrationKeys.QUERY);
  const inventoryService = container.resolve(Modules.INVENTORY);

  const { data: inventoryItems } = await query.graph({
    entity: "inventory_item",
    fields: ["id", "title", "variants.title", "variants.product.title"],
    pagination: { take: 1000 },
  });

  const updates: { id: string; title: string }[] = [];

  for (const item of inventoryItems as any[]) {
    const variant = item.variants?.[0];
    const nextTitle = buildInventoryItemTitle(
      variant?.product?.title,
      variant?.title
    );

    if (nextTitle && nextTitle !== item.title) {
      updates.push({ id: item.id, title: nextTitle });
    }
  }

  if (!updates.length) {
    logger.info("Inventory item titles are already up to date.");
    return;
  }

  await inventoryService.updateInventoryItems(updates);

  logger.info(`Renamed ${updates.length} inventory items to include the product name.`);
}
