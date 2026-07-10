# aynirape

New e-commerce platform for **[aynirape.com](https://aynirape.com/)** — Amazonian shamanic supplies
(rapé, tepi & kuripe, palo santo, agua de florida, ornaments).

Replaces the legacy custom PHP CMS. New stack:

- **Commerce backend:** [Medusa v2](https://medusajs.com/) (Node.js, Postgres, Redis)
- **Storefront:** [Astro](https://astro.build/) — based on the MIT
  [Bystrol/astro-medusa-starter](https://github.com/Bystrol/astro-medusa-starter)
  (React islands, Node adapter, country-prefixed routes) + a Keystatic-backed blog

## Monorepo layout

```
aynirape/
├── apps/
│   ├── backend/       # Medusa v2 (admin + Store/Admin APIs)  → :9009
│   └── storefront/    # Astro + Medusa starter                → :8000 (/de …)
├── packages/          # shared code (types, config, ui) — added as needed
├── docs/
│   └── architecture/  # ADRs & design docs  ← start here
├── pnpm-workspace.yaml
└── package.json
```

## Prerequisites

- Node `>=22` (see `.nvmrc`)
- pnpm `>=9`
- Postgres 15+ and Redis 7+ (local: Docker, or hosted)

## Bootstrap

Both apps are already scaffolded, wired, and seeded — see [`SETUP.md`](SETUP.md)
to run them and [docs/architecture/ADR-0001](docs/architecture/ADR-0001-stack-and-topology.md)
for the "why".

```bash
pnpm install
pnpm dev            # backend :9009 + storefront :8000
```

## Docs

- [Architecture decision records](docs/architecture/) — the "why" behind the stack
- [SETUP.md](SETUP.md) — bootstrap & local dev
