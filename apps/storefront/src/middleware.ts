import { HttpTypes } from "@medusajs/types";
import { defineMiddleware } from "astro:middleware";
import { sdk } from "./lib/sdk";

const MEDUSA_BACKEND_URL = import.meta.env.PUBLIC_MEDUSA_BACKEND_URL;
const DEFAULT_REGION = import.meta.env.DEFAULT_REGION;

const regionMapCache = {
  regionMap: new Map<string, HttpTypes.StoreRegion>(),
  regionMapUpdated: Date.now(),
};

function isStaticOrInternalPath(pathname: string) {
  // Astro/Vite internal and image optimization routes
  if (
    pathname === "/_astro" ||
    pathname.startsWith("/_astro/") ||
    pathname === "/_image" ||
    pathname.startsWith("/_image") ||
    pathname.startsWith("/@") || // e.g. /@vite, /@id, /@fs (dev)
    pathname.startsWith("/__") // e.g. /__vite_ping (dev)
  ) {
    return true;
  }

  // Common site root static files
  if (
    pathname === "/favicon.ico" ||
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml" ||
    pathname === "/manifest.webmanifest"
  ) {
    return true;
  }

  // Any file with an extension (images, css, js, fonts, etc.)
  const lastSegment = pathname.split("/").pop() ?? "";
  return lastSegment.includes(".") && lastSegment !== ".well-known";
}

/**
 * Language-based / non-commerce sections that must NOT be rewritten to a country
 * code. Blog is language-scoped (`/blog`, `/fr/blog`, …), Keystatic + its API are
 * infrastructure, and RSS/sitemap are feeds.
 */
function isNonCommercePath(pathname: string) {
  const seg = pathname.split("/").filter(Boolean);
  if (seg[0] === "blog" || seg[0] === "keystatic" || seg[0] === "api") return true;
  // localized blog: /<lang>/blog/...
  if (seg[1] === "blog" && ["fr", "it", "es"].includes(seg[0] ?? "")) return true;
  if (pathname === "/rss.xml" || pathname.startsWith("/sitemap")) return true;
  return false;
}

/**
 * Fetches regions from Medusa and caches them in a map.
 * @returns A map of country codes to regions.
 */
async function getRegionMap() {
  const { regionMap, regionMapUpdated } = regionMapCache;

  if (!MEDUSA_BACKEND_URL) {
    throw new Error(
      "src/middleware.ts: Error fetching regions. Did you set up regions in your Medusa Admin and define a PUBLIC_MEDUSA_BACKEND_URL environment variable?",
    );
  }

  const isCacheValid =
    regionMap.keys().next().value &&
    regionMapUpdated > Date.now() - 3600 * 1000; // 1 hour

  if (!isCacheValid) {
    try {
      const { regions } = await sdk.store.region.list();

      if (!regions?.length) {
        throw new Error(
          "No regions found. Please set up regions in your Medusa Admin.",
        );
      }

      regions.forEach((region: HttpTypes.StoreRegion) => {
        region.countries?.forEach((country) => {
          regionMapCache.regionMap.set(country.iso_2 ?? "", region);
        });
      });

      regionMapCache.regionMapUpdated = Date.now();
    } catch (error) {
      console.error(error);
      throw new Error("Failed to fetch regions from Medusa.");
    }
  }

  return regionMapCache.regionMap;
}

/**
 * Gets the country code from the URL pathname.
 * @param pathname
 * @returns The country code.
 */
async function getCountryCode(pathname: string) {
  let countryCode;

  const urlCountryCode = pathname.split("/")[1]?.toLowerCase();

  const regionMap = await getRegionMap();

  if (urlCountryCode && regionMap.has(urlCountryCode)) {
    countryCode = urlCountryCode;
  } else if (regionMap.has(DEFAULT_REGION)) {
    countryCode = DEFAULT_REGION;
  } else if (regionMap.keys().next().value) {
    countryCode = regionMap.keys().next().value;
  }

  return countryCode;
}

export const onRequest = defineMiddleware(async (context, next) => {
  // Never redirect non-page requests (assets, dev internals, etc.)
  if (isStaticOrInternalPath(context.url.pathname)) {
    return next();
  }

  // Blog, Keystatic and feeds are not region-scoped — leave their URLs untouched.
  if (isNonCommercePath(context.url.pathname)) {
    return next();
  }

  // Only redirect navigations; avoid changing semantics for form submits, etc.
  const method = context.request.method.toUpperCase();
  if (method !== "GET" && method !== "HEAD") {
    return next();
  }

  let redirectUrl = context.url.href;
  const origin = context.url.origin;
  const pathname = context.url.pathname;
  const search = context.url.search;

  const countryCode = await getCountryCode(pathname);

  const urlHasCountryCode =
    (countryCode && pathname.split("/")[1] === countryCode) ||
    pathname.split("/")[1].includes(`${countryCode}/`);

  if (urlHasCountryCode) {
    return next();
  }

  const redirectPath = pathname === "/" ? "" : pathname;

  const queryString = search || "";

  if (!urlHasCountryCode && countryCode) {
    redirectUrl = `${origin}/${countryCode}${redirectPath}${queryString}`;
    return context.redirect(redirectUrl, 307);
  }

  return next();
});
