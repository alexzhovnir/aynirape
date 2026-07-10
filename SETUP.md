# Setup & local development

> Read [docs/architecture/ADR-0001](docs/architecture/ADR-0001-stack-and-topology.md)
> first. **Payments ([ADR-0002](docs/architecture/ADR-0002-payments-high-risk.md))
> is a launch blocker — validate it before deep build-out.**

## 1. Prerequisites

- Node `>=22` — `nvm use` (reads `.nvmrc`)
- pnpm `>=9` — `corepack enable`
- Postgres 15+ and Redis 7+

Quick local infra with Docker:

```bash
docker run -d --name aynirape-pg  -e POSTGRES_USER=medusa -e POSTGRES_PASSWORD=medusa \
  -e POSTGRES_DB=aynirape -p 5432:5432 postgres:16
docker run -d --name aynirape-redis -p 6380:6379 redis:7   # 6380 avoids clashing with other local redis
```

## 2. Environment

```bash
cp .env.example .env
# fill in secrets; the payment keys stay empty until ADR-0002 is resolved
```

## 3. Scaffold the apps (one-time)

Already done in this repo (kept here for reference / rebuilds):

```bash
# Backend — Medusa v2 (flattened out of the starter's turbo monorepo into apps/backend)
pnpm dlx create-medusa-app@latest apps/backend --db-url "$DATABASE_URL" --seed --no-browser --use-pnpm

# Storefront — Bystrol/astro-medusa-starter cloned into apps/storefront,
# yarn.lock/.yarnrc removed, package name set to "storefront", `vite` added as a
# devDependency (its astro.config imports vite, which pnpm won't hoist).
git clone --depth 1 https://github.com/Bystrol/astro-medusa-starter apps/storefront
```

Each app's `package.json` must have `"name": "backend"` / `"name": "storefront"`
so the root scripts and `--filter` targets resolve.

## 4. Install & run

```bash
pnpm install
pnpm dev            # runs backend + storefront in parallel
# or individually:
pnpm dev:backend    # Medusa admin at http://localhost:9009/app
pnpm dev:storefront # storefront at http://localhost:8000 (→ /de)
```

## 5. Current local state (already bootstrapped)

Both apps are scaffolded and wired, and the backend DB is migrated + seeded with
Medusa demo data. What already exists on this machine:

- **Backend** runs on **port 9009** (`:9000` was taken by another local dev server;
  set via `PORT=9009` in `apps/backend/.env` — remove it to use the default 9000).
- **Admin dashboard:** http://localhost:9009/app —
  `admin@aynirape.com` / `AyniAdmin123!` (dev only — change it).
- **EU region (EUR)** and a **publishable API key** exist from the seed; the key is
  already in `apps/storefront/.env` as `PUBLIC_MEDUSA_PUBLISHABLE_KEY`.
- **Storefront** is the [Bystrol/astro-medusa-starter](https://github.com/Bystrol/astro-medusa-starter)
  (MIT, Astro + React islands + Medusa v2), wired to our backend. Adapter switched
  from Cloudflare to **Node** so Keystatic's admin can run (it needs a Node runtime).
  Runs on **port 8000** with country-prefixed routes: http://localhost:8000 → `/de`.
  Catalog `/de/store`, product `/de/store/:id`, `/de/cart`, `/de/checkout` all work
  against the seeded demo data.

Run both:

```bash
pnpm dev:backend    # http://localhost:9009/app
pnpm dev:storefront # http://localhost:8000  (redirects to /de)
```

> Payment step in checkout is intentionally inert: `PUBLIC_STRIPE_KEY` is empty
> because Stripe can't process tobacco/rapé (see ADR-0002).

### Blog (Content Collections + Keystatic) — see [ADR-0003](docs/architecture/ADR-0003-blog-content.md)

- **Read:** http://localhost:8000/blog — list, `/blog/:slug` posts, `/rss.xml`.
- **Edit:** http://localhost:8000/keystatic — git-based CMS UI. Posts are Markdoc
  files in `apps/storefront/src/content/posts/`; saving commits to the repo.
- Posts can embed product CTAs: `{% product-cta handle="<medusa-handle>" /%}`.
- Language-scoped, **outside** the `/de` commerce routing (EN at `/blog`, FR/IT/ES at
  `/<lang>/blog` — only EN is built so far).
- **Production note:** Keystatic uses `storage: "local"` (writes to the working tree).
  For an immutable/CDN production deploy, switch to `storage: { kind: "github", repo: "…" }`
  in `apps/storefront/keystatic.config.ts` so edits commit via the GitHub API.

> Note: Astro 7's `astro dev` daemonizes — manage it with `astro dev status`,
> `astro dev logs`, `astro dev stop` from `apps/storefront`.

The seeded catalogue is placeholder ("Medusa Shorts" etc.). Replace it with the real
aynirape catalogue per the [ADR-0001](docs/architecture/ADR-0001-stack-and-topology.md)
action items (product model, migration from the legacy site).
