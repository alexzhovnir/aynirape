# AyniRapé — Migration & Rebuild Roadmap

**Project:** Rebuild aynirape.com on a modern headless stack and migrate all data, hosting and email off the legacy MODX site.
**Format:** Phases and milestones (no fixed dates). Sequencing shows dependencies; timing is agreed at kickoff.

## Target stack

| Layer | Technology |
|---|---|
| Commerce backend | Medusa v2 (Node 22, PostgreSQL 16, Redis 7) |
| Storefront | Astro (headless, connected to Medusa) |
| Blog / content | Keystatic (Markdown, versioned in git) |
| Hosting | Single Hetzner Cloud VPS (Docker Compose) + staging — **client-owned account** |
| Email | Zoho Mail (mailboxes) + Resend (transactional) |
| Payments | PayPal + manual bank transfer |

## Scope at a glance

- **Migrate:** products, categories, customers, **all orders (including abandoned carts)**, 80 blog posts, static pages.
- **Languages:** English (primary), French, Italian, Spanish — translation delivered by the contractor.
- **Shipping:** flat rate, zones EE / EU (no carrier integration).
- **Deploy:** manual (no CI/CD); staging environment for acceptance.
- **SEO:** old→new 301 redirect map to preserve rankings.

---

## Phase sequence

```
P0 Kickoff & Access
        │
P1 Infrastructure (VPS + staging)
        │
P2 Payments  ◀── LAUNCH BLOCKER (PayPal high-risk verification)
        │
P3 Design  ◀── scoped separately after design brief
        │
P4 Catalog & Data Migration ──▶ (orders migrate AFTER catalog exists)
        │
P5 Localization (EN/FR/IT/ES)
        │
P6 Blog & SEO
        │
P7 Email Migration
        │
P8 QA & Acceptance (on staging)
        │
P9 Launch & Handover (+ warranty period)
```

### P0 — Kickoff & Access
**Goal:** everything needed to start is in hand.
**Milestones:** MySQL dump + product image files received · DNS/cPanel access · client Hetzner account access · client PayPal account · requirements confirmed · repo & environments initialized.

### P1 — Infrastructure
**Goal:** production + staging environments running the full stack.
**Milestones:** Hetzner VPS provisioned & hardened · Docker Compose (Postgres + Redis + Medusa + Astro + Caddy/auto-SSL) · **persistent staging environment** · manual deploy scripts · database backups (scheduled `pg_dump`) · ops runbook.
**Note:** hosting runs on the **client's** Hetzner account — no recurring hosting cost to the contractor.

### P2 — Payments  ⚠️ Launch blocker
**Goal:** customers can pay; both methods verified end-to-end.
**Milestones:** PayPal integrated in Medusa (checkout, webhooks, order flow) · **client guided through PayPal high-risk merchant verification** · manual bank-transfer method (instructions, admin confirmation flow) · end-to-end checkout tested.
**Why first after infra:** herbs/rapé is a high-risk payment category. Verification can be slow or refused and is **outside the contractor's control** — surfacing it early protects the timeline. Bank transfer is the fallback if PayPal stalls.

### P3 — Design  (scoped separately)
**Goal:** brand-aligned UI across the storefront.
**Milestones:** design brief agreed · ~11 page templates (Home, Category, Product, Cart, Checkout, Account [data/history/favorites], Blog list, Blog post, static pages) designed and applied to Astro.
**Note:** placeholder in the estimate — re-priced once the brief is in.

### P4 — Catalog & Data Migration
**Goal:** the store's data lives in Medusa, verified against the source.
**Milestones:** migration scripts (read MySQL dump → Medusa Admin API) · products, variants, prices, weights, descriptions · categories · product images uploaded · customers (no passwords — customers reset) · **all orders incl. abandoned carts** matched to the new catalog with statuses mapped · data validation & reconciliation.
**Dependency:** orders migrate **after** the catalog (order items must map to real catalog variants).
**Risk:** highest-uncertainty phase — effort depends on how cleanly legacy items map to the new catalog.

### P5 — Localization (4 languages)
**Goal:** the whole storefront available in EN / FR / IT / ES.
**Milestones:** i18n wired in Astro + Medusa product translations · UI strings · every product translated (×3 non-English) · categories · blog posts · static pages · language switch, localized routes, hreflang.
**Note:** large-volume phase (hundreds of products × 3 languages + 80 posts). AI-assisted translation with a human proofreading pass.

### P6 — Blog & SEO
**Goal:** content preserved and search rankings protected.
**Milestones:** 80 posts converted MODX HTML → Keystatic Markdown (images, front-matter, cleanup) · old→new **301 redirect map** (products/categories/blog/static) · sitemap, canonical & meta.

### P7 — Email Migration
**Goal:** email keeps working, independent of the old host.
**Milestones:** Zoho Mail Free set up (3 mailboxes) · existing mail migrated from WaveCom via IMAP · DNS (MX/SPF/DKIM/DMARC) · Resend configured for Medusa transactional mail (`send.` subdomain) · deliverability tested · cutover coordinated.

### P8 — QA & Acceptance
**Goal:** the client signs off on staging before go-live.
**Milestones:** full QA on staging — checkout (PayPal + bank transfer), shipping zones, catalog/search, account flows, migrated-order spot-checks, 4-language spot-checks, blog, redirects, responsive/cross-browser · client acceptance round · fixes.

### P9 — Launch & Handover
**Goal:** live on the new stack, client self-sufficient.
**Milestones:** production DNS cutover · final data + mail sync · go-live checklist & smoke tests · client training (admin, orders, content) · handover docs · **post-launch warranty/bugfix period**, then optional paid support.

---

## Key risks the client should know

1. **PayPal high-risk verification (P2)** — herbs/rapé category; approval can be slow or denied and is not in the contractor's hands. Mitigated by starting early and shipping bank transfer as a fallback.
2. **Order + abandoned-cart migration (P4)** — legacy and Medusa data models differ; matching old order items to the new catalog is the main source of variable effort.
3. **4-language translation volume (P5)** — hundreds of products plus the blog, ×3 languages; the single largest content workload.
4. **Manual deploy, no CI/CD** — cheaper, but releases and the data migration are run by hand; staging mitigates risk during acceptance.
