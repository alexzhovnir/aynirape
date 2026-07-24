import { sdk } from "../sdk";

interface CategoryParams {
  params: {
    countryCode: string;
    categoryHandle: string;
  };
}

const DEFAULT_COUNTRIES = ["de", "dk", "fr", "it", "es", "se", "gb"];
const DEFAULT_CATEGORY_HANDLES = [
  "rapé",
  "rape",
  "rap%C3%A9",
  "tepi-and-kuripe",
  "aromatics",
  "supplements",
  "ornaments-and-decoration",
];

export const getCategoryParams = async () => {
  let paths: CategoryParams[] = [];
  const addedKeys = new Set<string>();

  const addPath = (countryCode: string, handle: string) => {
    if (!countryCode || !handle) return;
    const normCountry = countryCode.toLowerCase();
    const key = `${normCountry}:${handle}`;
    if (!addedKeys.has(key)) {
      addedKeys.add(key);
      paths.push({
        params: {
          countryCode: normCountry,
          categoryHandle: handle,
        },
      });
    }
  };

  // 1. Pre-seed default fallbacks so Astro dev server always matches known routes instantly
  DEFAULT_COUNTRIES.forEach((c) => {
    DEFAULT_CATEGORY_HANDLES.forEach((h) => {
      addPath(c, h);
      try {
        const decoded = decodeURIComponent(h);
        addPath(c, decoded);
      } catch {}
    });
  });

  // 2. Dynamically fetch from Medusa API for any additional regions/categories
  try {
    const { regions } = await sdk.store.region.list();
    const { product_categories } = await sdk.store.category.list();

    regions.forEach((region) => {
      region.countries?.forEach((country) => {
        if (!country.iso_2) return;
        const countryCode = country.iso_2.toLowerCase();

        product_categories.forEach((cat) => {
          if (!cat.handle) return;

          addPath(countryCode, cat.handle);

          const encoded = encodeURIComponent(cat.handle);
          if (encoded !== cat.handle) {
            addPath(countryCode, encoded);
          }

          try {
            const decoded = decodeURIComponent(cat.handle);
            if (decoded !== cat.handle) {
              addPath(countryCode, decoded);
            }
          } catch {}

          const ascii = cat.handle.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
          if (ascii !== cat.handle) {
            addPath(countryCode, ascii);
          }
        });
      });
    });
  } catch (error) {
    console.error("getCategoryParams fetch error:", error);
  }

  return paths;
};
