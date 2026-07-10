# ADR-0003: Blog & editorial content (Astro Content Collections + Keystatic)

**Status:** Accepted
**Date:** 2026-07-10
**Deciders:** Alex Zhovnir (owner)

## Context

The legacy site has a content-marketing blog: ~48 posts (800–1000 words each),
featured + inline images, H2/H3 structure, excerpts, dates, pagination, and CTAs
into the shop ("Choose your first sacred blend"). Content exists in EN/FR/IT/ES.
No categories/tags/authors are exposed. For a niche brand, this blog is the primary
**organic-search** channel, so SEO and page speed matter more than editing bells.

The storefront is the Astro + Medusa starter ([ADR-0001](ADR-0001-stack-and-topology.md)):
static-first, React islands, with commerce routes prefixed by an **ISO-2 country code**
(`/de/…`) for region/currency. Adopting Keystatic forced the adapter from Cloudflare
edge to **`@astrojs/node`** — Keystatic's admin/API need a Node runtime.

## Decision

Blog posts are **Markdoc files in the repo** (`src/content/posts/*.mdoc`), read by an
Astro **content collection**, and edited through **Keystatic** — a git-based CMS whose
admin UI (`/keystatic`) commits those same files. No external CMS, no runtime DB.

- **Rendering:** blog pages are `prerender = true` → static HTML, cached on the edge.
- **Editing:** `/keystatic` gives a non-technical UI (fields, image upload, rich text).
  `storage: "local"` writes to the working tree (great in dev). For an immutable/CDN
  production deploy, use **`storage: { kind: "github" }`** so edits commit via the
  GitHub API instead of a (possibly read-only) production filesystem.
- **Product CTAs:** a Markdoc tag `{% product-cta handle="…" /%}` renders an Astro
  component that resolves the Medusa product by handle at build time and deep-links
  into the store.
- **SEO:** `@astrojs/sitemap`, `/rss.xml` (`@astrojs/rss`), per-post canonical,
  OpenGraph, JSON-LD `Article`, and hreflang from a shared `translationKey`.

### The routing decision that's easy to get wrong

Commerce is **region**-scoped (country code); the blog is **language**-scoped. Nesting
48 posts under 7 country codes would create massive duplicate content and an hreflang
mess. So the blog lives **outside** `[countryCode]`:

| Language | Route |
|----------|-------|
| English  | `/blog`, `/blog/:slug` |
| French   | `/fr/blog`, `/fr/blog/:slug` |
| Italian  | `/it/blog`, … |
| Spanish  | `/es/blog`, … |

`fr`/`it`/`es` double as commerce country codes *and* blog language prefixes (coherent:
`/fr` = French store, `/fr/blog` = French journal). English has no country of its own,
so EN blog sits at the bare `/blog`. The region middleware is patched to skip `/blog`,
`/<lang>/blog`, `/keystatic`, `/api`, and the feeds so they aren't rewritten to `/de/…`.

## Options Considered

| Option | Editing UX | SEO/speed | Infra | Verdict |
|--------|-----------|-----------|-------|---------|
| **Content Collections + Keystatic** | UI, git-committed | Excellent (static) | None (git) | **Chosen** |
| Pure MDX/Markdoc in git | Dev-only (IDE/PR) | Excellent | None | Fine if only devs edit |
| External headless CMS (Sanity/Storyblok) | Rich UI | Good | External service + cost | Overkill for ~48 posts |
| Medusa custom "blog" module | Build it yourself | Ties content to commerce DB | More code | Medusa isn't a CMS |

## Consequences

- **Easier:** static, fast, SEO-clean blog; content versioned in git; owner can edit
  via `/keystatic`; posts can embed live product CTAs.
- **Harder:** production editing needs Keystatic **GitHub storage** + a connected repo
  and auth; each save triggers a commit → rebuild/redeploy (fine for editorial cadence).
- **Revisit when:** editors need real-time preview or scheduling beyond git flow, or a
  separate non-dev media library is required.

## Action Items

1. [x] Content collection + Keystatic (`posts`), Markdoc, `/blog`, `/blog/:slug`, RSS,
   sitemap, SEO tags, `product-cta` tag, one demo post. Running on :8000.
2. [ ] Build the **FR/IT/ES** blog routes (`/<lang>/blog`, `/<lang>/blog/:slug`) reading
   the same collection filtered by `language`; wire the language switcher.
3. [ ] Switch Keystatic to **GitHub storage** for production editing.
4. [ ] Migrate the ~48 legacy posts → Markdoc (scrape → frontmatter + body + images).
5. [ ] Add listing pagination and, if desired, categories/tags.
6. [ ] Move cover images to S3/R2 + Astro image optimization (currently `public/`).
