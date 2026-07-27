import fs from "fs";
import path from "path";
import { ExecArgs } from "@medusajs/framework/types";
import { Modules } from "@medusajs/framework/utils";
import { createProductsWorkflow, updateProductsWorkflow } from "@medusajs/medusa/core-flows";

export default async function seedProducts({ container }: ExecArgs) {
  const logger = container.resolve("logger");
  const salesChannelModuleService = container.resolve(Modules.SALES_CHANNEL);
  const storeModuleService = container.resolve(Modules.STORE);
  const regionModuleService = container.resolve(Modules.REGION);
  const productModuleService = container.resolve(Modules.PRODUCT);
  
  // Try to find default sales channel
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
  const existingByHandle = new Map(existingProducts.map(p => [p.handle, p]));

  const productsData = JSON.parse(fs.readFileSync(productsPath, "utf-8"));
  
  const toCreate: any[] = [];
  const toUpdate: any[] = [];
  
  productsData.forEach((p: any) => {
    const imageUrls = p.images && p.images.length > 0 
      ? p.images.map((img: string) => `/images/products/${path.basename(img)}`) 
      : ["/images/products/placeholder.jpg"];
      
    const thumbnailUrl = imageUrls[0];
    
    const existing = existingByHandle.get(p.handle);
    
    if (existing) {
      toUpdate.push({
        id: existing.id,
        title: p.title,
        description: p.description,
        thumbnail: thumbnailUrl,
        images: imageUrls.map(url => ({ url })),
      });
    } else {
      toCreate.push({
        title: p.title,
        handle: p.handle,
        description: p.description,
        status: "published",
        thumbnail: thumbnailUrl,
        images: imageUrls.map(url => ({ url })),
        options: [
          {
            title: "Size",
            values: ["10g", "20g", "50g"]
          }
        ],
        variants: [
          {
            title: "10g",
            manage_inventory: false,
            allow_backorder: true,
            options: {
              "Size": "10g"
            },
            prices: [
              {
                amount: p.price > 0 ? p.price : 25,
                currency_code: "eur"
              }
            ]
          },
          {
            title: "20g",
            manage_inventory: false,
            allow_backorder: true,
            options: {
              "Size": "20g"
            },
            prices: [
              {
                amount: p.price > 0 ? p.price * 2 : 45,
                currency_code: "eur"
              }
            ]
          }
        ],
        sales_channels: [
          {
            id: defaultSalesChannel.id
          }
        ]
      });
    }
  });

  if (toUpdate.length > 0) {
    logger.info(`Updating ${toUpdate.length} existing products with new images...`);
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
