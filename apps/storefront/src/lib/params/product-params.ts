import { sdk } from "../sdk";

interface ProductParams {
  params: {
    countryCode: string;
    productId: string;
  };
}

const DEFAULT_COUNTRIES = [
  "de",
  "dk",
  "fr",
  "it",
  "es",
  "se",
  "gb",
  "us",
  "nl",
  "at",
  "ch",
  "cz",
  "pl",
];

const DEFAULT_PRODUCT_HANDLES = [
  "emburana",
  "nukini-sansara",
  "huni-kuin",
  "silver-tepi-applicator",
  "kuripe",
  "sananga",
  "canela-de-velho",
  "tsunu",
  "muleta",
  "nukini-jagube",
  "yawanawa-forza",
  "kuntanawa-jarina",
  "tepi",
];

export const getProductParams = async (): Promise<ProductParams[]> => {
  let paths: ProductParams[] = [];
  const addedKeys = new Set<string>();

  const addPath = (countryCode: string, productId: string) => {
    if (!countryCode || !productId) return;
    const normCountry = countryCode.toLowerCase();
    const key = `${normCountry}:${productId}`;
    if (!addedKeys.has(key)) {
      addedKeys.add(key);
      paths.push({
        params: {
          countryCode: normCountry,
          productId,
        },
      });
    }
  };

  // Pre-seed default routes for builds when Medusa API is unreachable
  DEFAULT_COUNTRIES.forEach((c) => {
    DEFAULT_PRODUCT_HANDLES.forEach((h) => {
      addPath(c, h);
    });
  });

  try {
    const { regions } = await sdk.store.region.list();
    const { products } = await sdk.store.product.list();

    regions?.forEach((region) => {
      region.countries?.forEach((country) => {
        if (!country.iso_2) return;
        const countryCode = country.iso_2.toLowerCase();

        products?.forEach((product) => {
          if (product.handle) {
            addPath(countryCode, product.handle);
          }
          if (product.id) {
            addPath(countryCode, product.id);
          }
        });
      });
    });
  } catch (error) {
    console.error("getProductParams fetch error:", error);
  }

  return paths;
};

