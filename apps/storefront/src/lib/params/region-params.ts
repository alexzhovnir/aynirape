import { sdk } from "../sdk";

interface RegionParams {
  params: {
    countryCode: string;
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
  "be",
  "no",
  "fi",
  "ie",
  "pt",
  "ca",
  "au",
];

export const getRegionParams = async () => {
  let paths: RegionParams[] = [];
  const addedKeys = new Set<string>();

  const addPath = (countryCode: string) => {
    if (!countryCode) return;
    const normCountry = countryCode.toLowerCase();
    if (!addedKeys.has(normCountry)) {
      addedKeys.add(normCountry);
      paths.push({
        params: {
          countryCode: normCountry,
        },
      });
    }
  };

  // Pre-seed default countries so Astro static build generates all language/region routes
  DEFAULT_COUNTRIES.forEach((c) => addPath(c));

  try {
    const { regions } = await sdk.store.region.list();

    regions?.forEach((region) => {
      region.countries?.forEach((country) => {
        if (country.iso_2) {
          addPath(country.iso_2);
        }
      });
    });
  } catch (error) {
    console.error("getRegionParams fetch error:", error);
  }

  return paths;
};

