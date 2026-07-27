import type { APIRoute } from "astro";
import { getCollection } from "astro:content";

export const prerender = true;

export const GET: APIRoute = async ({ site }) => {
  const baseUrl = site?.origin || "https://aynirape.com";
  
  // Fetch blog posts
  const posts = await getCollection("blog", ({ data }) => !data.draft);
  const englishPosts = posts.filter((p) => p.data.language === "en");

  // Create the llms.txt content
  let content = `# Ayni Rapé
> Ethically sourced Amazonian shamanic supplies, Rapé blends, Tepi & Kuripe applicators, and sacred aromatics.

## About Ayni Rapé
Ayni Rapé partners directly with 5 indigenous tribes in Peru and Brazil (Huni Kuin, Yawanawá, Nukini, Katukina, Shanenawa). We provide 100% fair trade direct products and dedicate 1% of proceeds to CO2 removal and tribal support.

## Main Pages
- [Home](${baseUrl}/en)
- [Store](${baseUrl}/en/store)
- [About Us](${baseUrl}/en/about)
- [Delivery & Payment](${baseUrl}/en/delivery-and-payment)

## Categories
- [Rapé](${baseUrl}/en/store/category/rape)
- [Kuripes & Tepis](${baseUrl}/en/store/category/kuripes-tepis)
- [Accessories](${baseUrl}/en/store/category/accessories)

## Recent Articles
`;

  englishPosts.forEach((post) => {
    const slug = post.id.replace(/\/index$/, "");
    content += `- [${post.data.title}](${baseUrl}/blog/${slug}): ${post.data.excerpt}\n`;
  });

  content += `\n## Contact\n- Email: info@aynirape.com\n`;

  return new Response(content, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
};
