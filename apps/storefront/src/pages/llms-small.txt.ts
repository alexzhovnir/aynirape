import type { APIRoute } from "astro";

export const prerender = true;

export const GET: APIRoute = async ({ site }) => {
  const baseUrl = site?.origin || "https://aynirape.com";

  const content = `# Ayni Rapé (llms-small.txt)
> Ethically sourced Amazonian shamanic supplies, Rapé blends, Tepi & Kuripe applicators, and sacred aromatics.

## Key Links
- Store: ${baseUrl}/us/store
- Blog: ${baseUrl}/blog
- About: ${baseUrl}/us/about
- Contact: info@aynirape.com
`;

  return new Response(content, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
};
