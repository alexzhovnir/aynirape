import { sdk } from "@lib/sdk";

export const listProducts = async (regionId: string, categoryId?: string) => {
  try {
    const { products } = await sdk.store.product.list({
      region_id: regionId,
      fields: "*variants.calculated_price,*categories,*images",
      ...(categoryId ? { category_id: [categoryId] } : {}),
    });
    return products;
  } catch (error) {
    console.error(error);
    throw new Error("Failed to fetch products");
  }
};

export const listCategories = async () => {
  try {
    const { product_categories } = await sdk.store.category.list();
    return product_categories;
  } catch (error) {
    console.error(error);
    throw new Error("Failed to fetch categories");
  }
};

export const retrieveProduct = async (
  idOrHandle: string,
  regionId: string,
) => {
  try {
    // First try looking up product by handle
    const { products } = await sdk.store.product.list({
      handle: idOrHandle,
      region_id: regionId,
      fields:
        "*variants.calculated_price,+variants.inventory_quantity,*variants.images,+metadata,+tags,*categories,*images",
    });

    if (products && products.length > 0) {
      return products[0];
    }

    // Fallback to direct lookup by Medusa product ID
    const { product } = await sdk.store.product.retrieve(idOrHandle, {
      region_id: regionId,
      fields:
        "*variants.calculated_price,+variants.inventory_quantity,*variants.images,+metadata,+tags,*categories,*images",
    });
    return product;
  } catch (error) {
    console.error(error);
    throw new Error("Failed to fetch product");
  }
};
