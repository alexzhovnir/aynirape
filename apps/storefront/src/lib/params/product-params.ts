import { sdk } from "../sdk";

interface ProductParams {
  params: {
    countryCode: string;
    productId: string;
  };
}

export const getProductParams = async (): Promise<ProductParams[]> => {
  try {
    const { regions } = await sdk.store.region.list();
    const { products } = await sdk.store.product.list();

    let paths: ProductParams[] = [];

    regions.forEach((region) => {
      region.countries?.forEach((country) => {
        products.forEach((product) => {
          if (!country.iso_2) {
            return;
          }

          const countryCode = country.iso_2.toLowerCase();

          // 1. Push SEO-friendly human-readable handle URL (e.g. /de/store/huni-kuin)
          if (product.handle) {
            paths.push({
              params: {
                countryCode,
                productId: product.handle,
              },
            });
          }

          // 2. Push raw Medusa product ID as fallback (e.g. /de/store/prod_01KX...)
          paths.push({
            params: {
              countryCode,
              productId: product.id,
            },
          });
        });
      });
    });

    return paths;
  } catch (error) {
    console.error(error);
    return [];
  }
};
