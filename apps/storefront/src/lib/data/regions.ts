import { sdk } from "@lib/sdk";
import type { HttpTypes } from "@medusajs/types";

const DEFAULT_REGION = import.meta.env.DEFAULT_REGION || "de";

const regionMap = new Map<string, HttpTypes.StoreRegion>();

const fallbackRegion: HttpTypes.StoreRegion = {
  id: "reg_default",
  name: "Europe / Default Region",
  currency_code: "eur",
  countries: [
    { iso_2: "de", display_name: "Germany" },
    { iso_2: "us", display_name: "United States" },
    { iso_2: "gb", display_name: "United Kingdom" },
    { iso_2: "fr", display_name: "France" },
    { iso_2: "es", display_name: "Spain" },
    { iso_2: "it", display_name: "Italy" },
    { iso_2: "dk", display_name: "Denmark" },
    { iso_2: "se", display_name: "Sweden" },
    { iso_2: "nl", display_name: "Netherlands" },
    { iso_2: "at", display_name: "Austria" },
    { iso_2: "ch", display_name: "Switzerland" },
    { iso_2: "cz", display_name: "Czech Republic" },
    { iso_2: "pl", display_name: "Poland" },
  ] as any,
} as any;

export const listRegions = async () => {
  try {
    const { regions } = await sdk.store.region.list();
    return regions;
  } catch (error) {
    console.error("listRegions error:", error);
    return [fallbackRegion];
  }
};

export const getRegion = async (countryCode: string) => {
  try {
    if (regionMap.has(countryCode)) {
      return regionMap.get(countryCode)!;
    }

    const regions = await listRegions();

    if (regions && regions.length > 0) {
      regions.forEach((region) => {
        region.countries?.forEach((country) => {
          if (country.iso_2) {
            regionMap.set(country.iso_2.toLowerCase(), region);
          }
        });
      });
    }

    const region = countryCode
      ? regionMap.get(countryCode.toLowerCase())
      : regionMap.get(DEFAULT_REGION.toLowerCase());

    return region || fallbackRegion;
  } catch {
    return fallbackRegion;
  }
};

