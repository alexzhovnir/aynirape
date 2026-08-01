import { getCollection } from "astro:content";
import type { APIContext } from "astro";

export const prerender = false;

const SITE_URL = "https://aynirape.com";

const staticPages = [
  "/us",
  "/us/about",
  "/us/contact",
  "/us/delivery-and-payment",
  "/us/impressum",
  "/us/privacy-policy",
  "/us/privacy",
  "/us/terms",
  "/blog"
];

const categories = [
  "/us/store/category/rap-e",
  "/us/store/category/tepi-and-kuripe",
  "/us/store/category/ornaments-and-decoration",
  "/us/store/category/aromatics",
  "/us/store/category/supplements"
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

export async function GET(context: APIContext) {
  const posts = await getCollection("blog", ({ data }) => !data.draft);

  const urls: string[] = [];

  // Static pages
  for (const path of staticPages) {
    urls.push(`
  <url>
    <loc>${SITE_URL}${path}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`);
  }

  // Categories
  for (const path of categories) {
    urls.push(`
  <url>
    <loc>${SITE_URL}${path}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>`);
  }

  // Products
  for (const handle of productHandles) {
    urls.push(`
  <url>
    <loc>${SITE_URL}/us/store/${handle}</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>`);
  }

  // Blog posts
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
