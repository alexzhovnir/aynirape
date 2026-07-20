import { sdk } from "../sdk";

interface CategoryParams {
  params: {
    countryCode: string;
    categoryHandle: string;
  };
}

export const getCategoryParams = async () => {
  try {
    const { regions } = await sdk.store.region.list();
    const { product_categories } = await sdk.store.category.list();

    let paths: CategoryParams[] = [];

    regions.forEach((region) => {
      region.countries?.forEach((country) => {
        if (!country.iso_2) return;

        product_categories.forEach((cat) => {
          if (!cat.handle) return;

          paths.push({
            params: {
              countryCode: country.iso_2.toLowerCase(),
              categoryHandle: cat.handle,
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
