import { ExecArgs } from "@medusajs/framework/types";
import { createProductsWorkflow } from "@medusajs/medusa/core-flows";
import * as fs from "fs";
import * as path from "path";

import { Modules } from "@medusajs/framework/utils";

export default async function seedProducts({ container }: ExecArgs) {
  const logger = container.resolve("logger");
  const salesChannelModuleService = container.resolve(Modules.SALES_CHANNEL);
  const storeModuleService = container.resolve(Modules.STORE);
  const regionModuleService = container.resolve(Modules.REGION);
  
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

  const productsData = JSON.parse(fs.readFileSync(productsPath, "utf-8"));
  
  const formattedProducts = productsData.map((p: any) => {
    // We map the images to point to the storefront public URL for now 
    // or just local relative paths that the storefront can render.
    // e.g. /images/products/emburana-0.jpg
    const imageUrl = `/images/products/${path.basename(p.images[0])}`;
    
    return {
      title: p.title,
      handle: p.handle,
      description: p.description,
      status: "published",
      thumbnail: imageUrl,
      images: [
        { url: imageUrl }
      ],
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
              amount: 25,
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
              amount: 45,
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
    };
  });

  const productModuleService = container.resolve(Modules.PRODUCT);
  
  const existingProducts = await productModuleService.listProducts({});
  const existingHandles = new Set(existingProducts.map(p => p.handle));
  
  const newProducts = formattedProducts.filter(p => !existingHandles.has(p.handle));

  if (newProducts.length === 0) {
    logger.info("All products already exist.");
    return;
  }

  logger.info(`Creating ${newProducts.length} new products...`);
  
  try {
    await createProductsWorkflow(container).run({
      input: {
        products: newProducts
      }
    });
    logger.info("Products seeded successfully.");
  } catch (error) {
    logger.error("Failed to seed products", error);
  }
}
