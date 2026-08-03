import { getCollection } from "astro:content";
import type { APIContext } from "astro";

export const prerender = false;

const SITE_URL = "https://aynirape.com";

const REGIONS = ["us", "de", "fr", "es", "it", "gb"];

const staticPathSuffixes = [
  "",
  "/about",
  "/contact",
  "/delivery-and-payment",
  "/impressum",
  "/privacy-policy",
  "/terms",
  "/store",
];

const categories = [
  "rap-e",
  "tepi-and-kuripe",
  "ornaments-and-decoration",
  "aromatics",
  "supplements",
];

const productHandles = [
  "emburana", "nukini-sansara", "huni-kuin", "caboclo-parica", "yawanawa",
  "jaguar", "spiritual-cleanse-i", "kuripe-jaguar-tamarind", "kuripe-wolf-sawo",
  "kuripe-colibri-crocodile", "kuripe-simple-sonokeling", "tepi-tamarind",
  "tepi-bamboo-small", "kuripe-eagle-tamarind", "kuripe-snake-hibiscus",
  "tepi-sonokeling", "tepi-hibiscus", "tepi-sawo", "kuripe-frog-sono",
  "kuripe-simple-tamarind", "kuripe-owl-teak", "kuripe-simple-sawo",
  "kuripe-turtle-hibiscus", "kuripe-simple-hibiscus", "ceremonial-carpet",
  "agua-de-florida", "palo-santo", "guarana-powder", "blue-lotus-flowers",
  "maca-powder", "rape-sample-set-3x5g", "rape-sample-set-6x5g",
  "kuntanawa-jarina", "nukini-rosa-branca", "mulateiro", "shamanic-cleanse-ii",
  "canela-de-velho", "cacau", "tsunu", "kuntanawa-sananga", "sananga",
  "veia-de-paje", "murici", "jurema"
];

const slugOf = (id: string) => id.replace(/\/index$/, "").replace(/\.(mdoc|md)$/, "");

function buildHreflangLinks(pathSuffix: string): string {
  return `
    <xhtml:link rel="alternate" hreflang="x-default" href="${SITE_URL}/us${pathSuffix}"/>
    <xhtml:link rel="alternate" hreflang="en" href="${SITE_URL}/us${pathSuffix}"/>
    <xhtml:link rel="alternate" hreflang="de" href="${SITE_URL}/de${pathSuffix}"/>
    <xhtml:link rel="alternate" hreflang="fr" href="${SITE_URL}/fr${pathSuffix}"/>
    <xhtml:link rel="alternate" hreflang="es" href="${SITE_URL}/es${pathSuffix}"/>
    <xhtml:link rel="alternate" hreflang="it" href="${SITE_URL}/it${pathSuffix}"/>`;
}

export async function GET(context: APIContext) {
  const posts = await getCollection("blog", ({ data }) => !data.draft);

  const urls: string[] = [];

  // 1. Static pages for all regions
  for (const suffix of staticPathSuffixes) {
    for (const region of REGIONS) {
      urls.push(`
  <url>
    <loc>${SITE_URL}/${region}${suffix}</loc>${buildHreflangLinks(suffix)}
    <changefreq>weekly</changefreq>
    <priority>${suffix === "" ? "1.0" : "0.8"}</priority>
  </url>`);
    }
  }

  // 2. Categories for all regions
  for (const catHandle of categories) {
    const suffix = `/store/category/${catHandle}`;
    for (const region of REGIONS) {
      urls.push(`
  <url>
    <loc>${SITE_URL}/${region}${suffix}</loc>${buildHreflangLinks(suffix)}
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>`);
    }
  }

  // 3. Products for all regions
  for (const handle of productHandles) {
    const suffix = `/store/${handle}`;
    for (const region of REGIONS) {
      urls.push(`
  <url>
    <loc>${SITE_URL}/${region}${suffix}</loc>${buildHreflangLinks(suffix)}
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>`);
    }
  }

  // 4. Standalone Blog index & posts
  urls.push(`
  <url>
    <loc>${SITE_URL}/blog</loc>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>`);

  for (const post of posts) {
    const rawSlug = slugOf(post.id);
    const lang = post.data.language || "en";
    let blogPath = `/blog/${rawSlug}`;
    if (lang !== "en") {
      const cleanSlug = rawSlug.replace(new RegExp(`-${lang}$`), "");
      blogPath = `/${lang}/blog/${cleanSlug}`;
    }

    urls.push(`
  <url>
    <loc>${SITE_URL}${blogPath}</loc>
    <lastmod>${post.data.publishedDate.toISOString().split("T")[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`);
  }

  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls.join("")}
</urlset>`;

  return new Response(sitemapXml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}

