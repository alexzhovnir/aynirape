import { sdk } from "@lib/sdk";

export const listProducts = async (regionId: string, categoryId?: string) => {
  try {
    const { products } = await sdk.store.product.list({
      region_id: regionId,
      fields: "*variants.calculated_price,*categories",
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
  productId: string,
  regionId: string,
) => {
  try {
    const { product } = await sdk.store.product.retrieve(productId, {
      region_id: regionId,
      fields:
        "*variants.calculated_price,+variants.inventory_quantity,*variants.images,+metadata,+tags,*categories",
    });
    return product;
  } catch (error) {
    console.error(error);
    throw new Error("Failed to fetch product");
  }
};
