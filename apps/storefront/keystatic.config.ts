import { config, fields, collection } from "@keystatic/core";

/**
 * Keystatic — git-based CMS. Content is authored through the UI at /keystatic
 * and committed as Markdoc files in the repo (src/content/posts). Astro reads the
 * same files as a content collection (see src/content.config.ts).
 *
 * storage: "local" writes to the working tree — perfect for local editing and
 * `astro dev`. For production editing on Cloudflare (edge, no filesystem), switch
 * to { kind: "github", repo: "owner/name" } so edits commit via the GitHub API.
 */
export default config({
  storage: { kind: "local" },
  ui: {
    brand: { name: "AyniRape Blog" },
  },
  collections: {
    posts: collection({
      label: "Blog posts",
      slugField: "title",
      path: "src/content/posts/*",
      format: { contentField: "content" },
      columns: ["title", "language", "publishedDate"],
      schema: {
        title: fields.slug({
          name: { label: "Title" },
          slug: {
            label: "SEO-friendly slug",
            description: "Used in the URL: /blog/<slug>",
          },
        }),
        language: fields.select({
          label: "Language",
          options: [
            { label: "English", value: "en" },
            { label: "Français", value: "fr" },
            { label: "Italiano", value: "it" },
            { label: "Español", value: "es" },
          ],
          defaultValue: "en",
        }),
        translationKey: fields.text({
          label: "Translation key",
          description:
            "Same value across the language variants of one article — powers hreflang links.",
        }),
        excerpt: fields.text({
          label: "Excerpt",
          multiline: true,
          description: "Shown in listings and as the meta description.",
        }),
        publishedDate: fields.date({ label: "Published date" }),
        draft: fields.checkbox({
          label: "Draft",
          description: "Drafts are hidden from the live site.",
          defaultValue: false,
        }),
        coverImage: fields.image({
          label: "Cover image",
          directory: "public/images/blog",
          publicPath: "/images/blog/",
        }),
        relatedProducts: fields.array(
          fields.text({ label: "Product handle" }),
          {
            label: "Related product handles",
            description: "Medusa product handles to feature as CTAs.",
            itemLabel: (props) => props.value,
          },
        ),
        content: fields.markdoc({ label: "Content" }),
      },
    }),
  },
});
