import rss from "@astrojs/rss";
import { getCollection } from "astro:content";
import type { APIContext } from "astro";

export const prerender = true;

const slugOf = (id: string) => id.replace(/\/index$/, "");

export async function GET(context: APIContext) {
  const posts = (
    await getCollection("blog", ({ data }) => data.language === "en" && !data.draft)
  ).sort((a, b) => b.data.publishedDate.getTime() - a.data.publishedDate.getTime());

  return rss({
    title: "AyniRape Journal",
    description:
      "Guides and rituals for rapé, tepi & kuripe, palo santo and Amazonian ceremony.",
    site: context.site ?? "https://aynirape.com",
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.excerpt,
      pubDate: post.data.publishedDate,
      link: `/blog/${slugOf(post.id)}`,
    })),
  });
}
