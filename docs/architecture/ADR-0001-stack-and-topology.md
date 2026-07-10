# ADR-0001: Commerce stack & system topology (Medusa v2 + Astro)

**Status:** Proposed
**Date:** 2026-07-10
**Deciders:** Alex Zhovnir (owner)

## Context

aynirape.com currently runs on a **custom PHP CMS** (phpthumbof caching artifacts
in the markup). We are rebuilding it from scratch in this repo. The catalogue and
audience are already well defined by the existing site:

**What we sell** — Amazonian shamanic supplies sourced from indigenous tribes in
Peru and Brazil:
- **Rapé** — powdered herbal snuff blends (from ~€14.95)
- **Applicators** — tepi & kuripe tubes (€9.99 – €450)
- **Aromatics** — palo santo, agua de florida
- **Supplements / wellness**
- **Ornaments** — e.g. huayruro-seed bracelets

**Non-functional requirements observed on the live site**
- **Multi-language:** EN, FR, IT, ES
- **Currency:** EUR, EU-centric, ships internationally
- **Age gate:** hard 18+ confirmation
- **Merchandising:** category filtering, "Bestsellers" / "Popular" tags
- **Content:** blog (usage & care), FAQ, customer reviews
- **Accounts:** login, favourites/wishlist
- **Scale:** small-catalogue niche retailer — dozens–low-hundreds of SKUs,
  modest traffic. Correctness, SEO, and payments matter far more than raw scale.

**Hard constraint that shapes everything downstream:** rapé is a **tobacco snuff**
(typically *Nicotiana rustica*). Most mainstream payment processors (Stripe,
PayPal, Braintree) prohibit tobacco/nicotine in their acceptable-use policies.
This is the single biggest risk in the project and is treated separately in
[ADR-0002](ADR-0002-payments-high-risk.md).

The mandated stack is **Medusa v2** (commerce backend) + **Astro** (storefront).
This ADR records *why that fits* and *how the pieces fit together*, rather than
re-opening the stack choice.

## Decision

Build a **decoupled (headless) commerce system** in a pnpm monorepo:

- **`apps/backend` — Medusa v2** owns the commerce domain: products, variants,
  pricing, regions, carts, orders, customers, promotions, fulfillment, and the
  **admin dashboard**. Exposes the Store API (public storefront) and Admin API.
  Backed by **Postgres** (system of record) and **Redis** (event bus, workflow
  engine, cache).
- **`apps/storefront` — Astro** renders the shopping experience. Static/SSR pages
  for catalogue and content (great SEO + Core Web Vitals), **islands** for the
  interactive bits (cart, age gate, wishlist, checkout), talking to Medusa over
  the Store API via `@medusajs/js-sdk`.
- Contracts between them are Medusa's typed Store API + a shared `packages/`
  space for TypeScript types and config as the surface grows.

```
                         ┌──────────────────────────┐
   Shopper ──────────▶   │   Astro storefront (SSR)  │
                         │   apps/storefront         │
                         └────────────┬─────────────┘
                                      │ Store API (HTTPS, publishable key)
                                      ▼
                         ┌──────────────────────────┐        ┌────────────┐
   Admin ───────────▶    │      Medusa v2 backend    │──────▶ │  Postgres  │
   (dashboard)           │      apps/backend         │        └────────────┘
                         │  Store API │ Admin API     │──────▶ ┌────────────┐
                         └─────┬───────────┬──────────┘        │   Redis    │
                               │           │                   └────────────┘
                        Payment│    Fulfillment / email /
                        provider│    file storage (S3) modules
                               ▼
                        (see ADR-0002)
```

## Options Considered

The backend and storefront were mandated, but each had a real fork worth recording.

### Backend — Medusa v2 (chosen) vs. Medusa v1 vs. SaaS (Shopify/Commerce.js)

| Dimension | Medusa v2 (chosen) | Medusa v1 | Shopify (SaaS) |
|-----------|--------------------|-----------|----------------|
| Complexity | Medium — self-host Postgres/Redis | Medium | Low |
| Cost | Infra only (~€20–50/mo) | Infra only | €€ + txn fees |
| Data ownership | Full | Full | Locked in |
| **Tobacco AUP** | **We control the processor** | We control | **Shopify Payments bans tobacco** |
| Customisation | Module architecture, code-owned | Older core | Limited by platform |
| Longevity | Current, actively developed | Maintenance mode | N/A |

**Pros of Medusa v2:** modern module architecture, workflows engine, first-class
multi-region/multi-currency, code-owned so we can integrate a **high-risk payment
provider** (impossible on Shopify Payments). **Cons:** we run and monitor the
infra; smaller ecosystem than Shopify.

The SaaS route is disqualified less by cost than by the **tobacco AUP** — the same
reason the payment ADR exists. Self-hosting the commerce engine is what keeps the
choice of processor in our hands.

### Storefront — Astro (chosen) vs. Next.js (Medusa's reference starter)

| Dimension | Astro (chosen) | Next.js |
|-----------|----------------|---------|
| SEO / content pages | Excellent — ships zero JS by default | Good |
| Interactivity | Islands (React/Vue/Svelte per-component) | Whole-app React |
| Blog / FAQ / editorial | Native content collections | Needs MDX plumbing |
| Medusa reference starter | Community | **Official** |
| Team familiarity | — | — |

**Pros of Astro:** this is a **content-heavy catalogue** (blog, FAQ, care guides,
educational framing) with a **small interactive core** (cart, age gate, wishlist,
checkout) — Astro's "static by default, hydrate the islands" model is a near-exact
fit, and gives the best SEO/CWV for a niche brand that lives on organic search.
**Cons:** we don't get Medusa's official Next.js starter for free — we wire the
Store API ourselves via `@medusajs/js-sdk` (well-documented, modest effort).

## Cross-cutting design decisions

- **i18n (EN/FR/IT/ES):** storefront uses Astro's i18n routing (`/`, `/fr`, `/it`,
  `/es`). Product/category **content** is translated in Medusa (v2 supports
  translatable fields / a translation module); static UI strings live in the
  storefront. Currency stays EUR via a single default region initially.
- **Regions & currency:** one **EU region (EUR)** to start; Medusa regions make
  adding USD/GBP or country-specific tax/shipping a config change, not a rebuild.
- **Age gate (18+):** a storefront island setting a first-party cookie, enforced
  before add-to-cart and checkout. Legal gate only — not a payment control.
- **Content (blog / FAQ / reviews):** blog + FAQ as **Astro content collections**
  (Markdown/MDX in-repo — fast, versioned, no CMS to run). Revisit a headless CMS
  only if non-technical editors need it. Reviews via a Medusa custom module or an
  embedded third-party (Trustpilot/Judge.me-style) — decide in a later ADR.
- **Wishlist/favourites:** Medusa customer + a `wishlist` custom module.
- **Media:** product images via the S3 file module (Cloudflare R2 / AWS S3) in
  prod; local disk in dev.
- **Search:** start with Store API filtering; add MeiliSearch/Algolia module if
  the catalogue or query needs grow.
- **Email:** transactional (order confirmation, shipping) via a notification
  module (Resend/SendGrid).

## Deployment topology

| Component | Dev | Production (proposed) |
|-----------|-----|-----------------------|
| Backend | `pnpm dev:backend` | Medusa Cloud, Railway, or a container host |
| Postgres | Docker | Managed (Neon / Supabase / RDS) |
| Redis | Docker | Managed (Upstash / managed Redis) |
| Storefront | `pnpm dev:storefront` | **Node** host (Vercel / Railway / container) |
| Media | local disk | S3 / Cloudflare R2 |

> The storefront originally used the Cloudflare edge adapter, but Keystatic's admin
> (see [ADR-0003](ADR-0003-blog-content.md)) needs a Node runtime, so we switched to
> `@astrojs/node`. Product pages are still prerendered static; only dynamic routes SSR.
> Revisit edge deployment only if the blog CMS is decoupled from this app.

Backend and storefront deploy independently. The storefront only needs the backend
URL + a **publishable API key**; secrets (DB, payment keys) never reach the browser.

## Consequences

**Easier**
- Best-in-class SEO/CWV for an organic-search-driven niche brand.
- Full control of the payment processor — the only way to legally sell rapé online.
- Content (blog/FAQ) lives in-repo, versioned, no extra CMS to operate.
- Independent scaling/deploys of storefront vs. backend.

**Harder**
- We operate infra (Postgres, Redis, backend host) — needs backups & monitoring.
- No official Astro↔Medusa starter; we build the API integration layer.
- i18n across storefront strings *and* Medusa content is real, ongoing work.

**Revisit when**
- A payment provider is confirmed ([ADR-0002](ADR-0002-payments-high-risk.md)) —
  **this can block launch and should be validated before deep build-out.**
- Non-technical staff need to edit content → evaluate a headless CMS.
- Catalogue/traffic grows enough to justify dedicated search.

## Action Items

1. [ ] **De-risk payments first** — resolve [ADR-0002](ADR-0002-payments-high-risk.md)
   before committing to full build-out; it can invalidate assumptions.
2. [x] Scaffold `apps/backend` with `create-medusa-app`; wire Postgres + Redis. *(done;
   flattened out of the starter's turbo monorepo into a single workspace app.)*
3. [x] Storefront: **adopted the MIT [Bystrol/astro-medusa-starter](https://github.com/Bystrol/astro-medusa-starter)**
   (Astro + React islands, Cloudflare adapter, country-prefixed routes) instead of
   hand-building — ships cart, multi-step checkout, region routing out of the box.
   Wired to our Medusa; running on :8000.
4. [ ] Model the catalogue in Medusa (product types, categories, tags, EU/EUR region).
5. [ ] Migrate products/content/images from the legacy PHP site (write an import script).
6. [~] Core islands: cart & checkout come from the starter. Still to add: **age gate**
   (18+) and **wishlist**. Swap the starter's **Stripe** payment step per ADR-0002.
7. [ ] Configure Astro i18n (EN/FR/IT/ES) + Medusa content translations.
8. [ ] Set up S3/R2 media, transactional email, and reviews.
9. [ ] Redirect map from legacy URLs → new URLs to preserve SEO.
