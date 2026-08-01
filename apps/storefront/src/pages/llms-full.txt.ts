import type { APIRoute } from "astro";
import { getCollection } from "astro:content";

export const prerender = true;

export const GET: APIRoute = async ({ site }) => {
  const baseUrl = site?.origin || "https://aynirape.com";
  const posts = await getCollection("blog", ({ data }) => !data.draft);
  const englishPosts = posts.filter((p) => p.data.language === "en");

  let content = `# Ayni Rapé — Complete AI Knowledge Base (llms-full.txt)
> Ethically sourced Amazonian shamanic supplies, Rapé blends, Tepi & Kuripe applicators, and sacred aromatics.

## About Ayni Rapé
Ayni Rapé partners directly with 5 indigenous tribes in Peru and Brazil (Huni Kuin, Yawanawá, Nukini, Katukina, Shanenawa). We provide 100% fair trade direct products and dedicate 1% of proceeds to CO2 removal and tribal support.

## Product Categories
- Rapé Blends: Premium sacred snuff powders made with traditional Mapacho and native tree ashes (Tsunu, Murici, Paricá, Mulateiro, Canela de Velho).
- Tepi & Kuripe Applicators: Handcrafted shamanic applicators made from sustainable bamboo, tamarind, sonokeling, and sawo wood.
- Sacred Aromatics: Authentic Agua de Florida cologne, Palo Santo wood sticks, and Blue Lotus flowers.
- Natural Supplements: Organic Guaraná seed powder and Maca root powder.

## Main Navigation Pages
- Home: ${baseUrl}/us
- Store: ${baseUrl}/us/store
- About Us: ${baseUrl}/us/about
- Delivery & Payment: ${baseUrl}/us/delivery-and-payment
- Contact: ${baseUrl}/us/contact

## Articles & Guides (${englishPosts.length} Publications)
`;

  englishPosts.forEach((post) => {
    const slug = post.id.replace(/\/index$/, "").replace(/\.(mdoc|md)$/, "");
    content += `\n### [${post.data.title}](${baseUrl}/blog/${slug})\nExcerpt: ${post.data.excerpt}\n`;
  });

  content += `\n## Contact Information\nEmail: info@aynirape.com\nWebsite: https://aynirape.com\n`;

  return new Response(content, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
};
