import fs from "fs";
import path from "path";
import { ExecArgs } from "@medusajs/framework/types";
import { Modules, ProductStatus } from "@medusajs/framework/utils";
import { createProductsWorkflow, updateProductsWorkflow } from "@medusajs/medusa/core-flows";

export default async function seedProducts({ container }: ExecArgs) {
  const logger = container.resolve("logger");
  const salesChannelModuleService = container.resolve(Modules.SALES_CHANNEL);
  const productModuleService = container.resolve(Modules.PRODUCT);

  const [salesChannels] = await salesChannelModuleService.listAndCountSalesChannels({});
  const defaultSalesChannel = salesChannels[0];

  if (!defaultSalesChannel) {
    logger.warn("No default sales channel found, skipping seeding.");
    return;
  }

  const productsPath = path.resolve(__dirname, "../../../../scripts/products.json");
  if (!fs.existsSync(productsPath)) {
    logger.warn("products.json not found");
    return;
  }

  const existingProducts = await productModuleService.listProducts({});
  const existingByHandle = new Map(existingProducts.map((p) => [p.handle, p]));

  const productsData = JSON.parse(fs.readFileSync(productsPath, "utf-8"));

  const toCreate: any[] = [];
  const toUpdate: any[] = [];

  productsData.forEach((p: any) => {
    const imageUrls = p.images && p.images.length > 0 ? p.images : ["/images/products/placeholder.jpg"];
    const thumbnailUrl = imageUrls[0];

    const variants = (p.variants && p.variants.length > 0)
      ? p.variants.map((v: any) => ({
          title: v.title || "Default Variant",
          manage_inventory: false,
          allow_backorder: true,
          options: { Size: v.size || "Standard" },
          prices: [
            { amount: v.price || p.price || 25, currency_code: "eur" },
            { amount: Math.round((v.price || p.price || 25) * 1.1), currency_code: "usd" }
          ]
        }))
      : [
          {
            title: "Standard",
            manage_inventory: false,
            allow_backorder: true,
            options: { Size: "Standard" },
            prices: [
              { amount: p.price || 25, currency_code: "eur" },
              { amount: Math.round((p.price || 25) * 1.1), currency_code: "usd" }
            ]
          }
        ];

    const existing = existingByHandle.get(p.handle);

    if (existing) {
      toUpdate.push({
        id: existing.id,
        title: p.title,
        description: p.description,
        thumbnail: thumbnailUrl,
        images: imageUrls.map((url: string) => ({ url })),
      });
    } else {
      toCreate.push({
        title: p.title,
        handle: p.handle,
        description: p.description,
        status: ProductStatus.PUBLISHED,
        thumbnail: thumbnailUrl,
        images: imageUrls.map((url: string) => ({ url })),
        options: [
          {
            title: "Size",
            values: Array.from(new Set(variants.map((v: any) => v.options.Size)))
          }
        ],
        variants,
        sales_channels: [
          {
            id: defaultSalesChannel.id
          }
        ]
      });
    }
  });

  if (toUpdate.length > 0) {
    logger.info(`Updating ${toUpdate.length} existing products...`);
    try {
      await updateProductsWorkflow(container).run({
        input: { products: toUpdate }
      });
      logger.info("Products updated successfully.");
    } catch (err) {
      logger.error("Failed to update products", err);
    }
  }

  if (toCreate.length > 0) {
    logger.info(`Creating ${toCreate.length} new products...`);
    try {
      await createProductsWorkflow(container).run({
        input: { products: toCreate }
      });
      logger.info("Products created successfully.");
    } catch (err) {
      logger.error("Failed to create products", err);
    }
  }
}

