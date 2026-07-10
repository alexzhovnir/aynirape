import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

// Blog posts authored via Keystatic (Markdoc) and stored in src/content/posts.
const blog = defineCollection({
  loader: glob({ pattern: "**/*.mdoc", base: "./src/content/posts" }),
  schema: z.object({
    title: z.string(),
    language: z.enum(["en", "fr", "it", "es"]).default("en"),
    translationKey: z.string().optional(),
    excerpt: z.string().optional(),
    publishedDate: z.coerce.date(),
    draft: z.boolean().default(false),
    coverImage: z.string().optional(),
    relatedProducts: z.array(z.string()).default([]),
  }),
});

export const collections = { blog };
