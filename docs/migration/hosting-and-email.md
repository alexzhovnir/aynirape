# Migration plan — hosting & email (WaveCom → Hetzner + Zoho)

> Status: **decided**, not yet executed.
> Scope: move the site off WaveCom shared hosting; keep email cheap.

## Decisions

| Concern | Decision | Cost |
|---|---|---|
| App hosting | **Single Hetzner Cloud VPS — CAX21** (ARM, 4 vCPU / 8 GB / 80 GB NVMe) | ~€7.5/mo + VAT |
| Everything on one box | Postgres 16 + Redis 7 + Medusa v2 + Astro + Caddy (reverse-proxy, auto-SSL), via Docker Compose | — |
| Mailboxes | **Zoho Mail — Forever Free** (5 users, 5 GB each, 1 domain, webmail/app only) | €0 |
| Transactional email (Medusa `noreply@`) | **Resend** — known stack, free tier is enough for now | €0 |
| Domain + DNS | `aynirape.com` registration stays; repoint records only | — |
| Enable VPS backups | Hetzner Backups (~+20%) + cron `pg_dump` | ~€1.5/mo |

WaveCom shared hosting can be **cancelled** once mail + site are verified on the new setup. VPS is **not** part of the WaveCom shared plan — it's a separate product.

## Why the pieces are independent

Site and email are different DNS records — moving one never breaks the other:
- **A / AAAA** → website (Hetzner VPS IP)
- **MX + SPF/DKIM/DMARC** → email (Zoho)
- Resend sends from a **sending subdomain** (`send.aynirape.com`) so its SPF/DKIM never collide with Zoho's root-domain records.

## DNS records (fill account-specific values at setup)

Zoho — EU data center (`.eu`) since we're in the EU; use `.com` variants only if the Zoho account was created in the US DC.

```
# Website (Hetzner)
@              A       <HETZNER_VPS_IP>
www            CNAME   aynirape.com.

# Mailboxes (Zoho, EU DC)
@              MX      10  mx.zoho.eu.
@              MX      20  mx2.zoho.eu.
@              MX      50  mx3.zoho.eu.
@              TXT     "v=spf1 include:zohomail.eu -all"          # see Resend note below
zmail._domainkey  TXT  "<Zoho DKIM value from admin console>"
_dmarc         TXT     "v=DMARC1; p=quarantine; rua=mailto:contact@aynirape.com"

# Transactional (Resend, on a sending subdomain — records come from Resend dashboard)
send           MX      10  feedback-smtp.<region>.amazonses.com.   # exact value from Resend
send           TXT     "v=spf1 include:amazonses.com ~all"         # exact value from Resend
resend._domainkey.send  TXT  "<Resend DKIM value>"
```

> SPF note: root `@` SPF stays **Zoho-only** because Resend sends from the `send.` subdomain,
> which carries its own SPF. If you ever send from `noreply@aynirape.com` (root) instead of
> `noreply@send.aynirape.com`, merge the includes into one root record:
> `v=spf1 include:zohomail.eu include:amazonses.com ~all` (one SPF record max per name).

## Email migration into Zoho Free

Zoho Free disables IMAP for *external clients connecting to Zoho* — it does **not** block
inbound migration, because Zoho's server pulls from WaveCom (whose IMAP is on).

Method: **Zoho Admin Console → Migration → IMAP Migration**, source = WaveCom IMAP
(`mail.aynirape.com` / their `webN.wavecom.ee`, port 993 SSL), per-mailbox credentials.
Alternative: web **Settings → Import/Export** (POP fetch or `.eml`/`.mbox` upload).

Mailboxes to move: `brice@`, `contact@`, `noreply@` (system `aynirape` account is cPanel-internal, skip).

### Cutover order (no lost mail)

1. Create the 3 mailboxes in Zoho, verify domain (TXT).
2. Run IMAP Migration WaveCom → Zoho **while MX still points at WaveCom**.
3. Switch MX + SPF/DKIM/DMARC to Zoho.
4. Keep WaveCom live ~2 days so trailing mail lands on the old MX.
5. Final migration pass, then decommission WaveCom.

### Leaving Zoho later

No lock-in (domain is ours). To export *out of* Zoho Free you need IMAP, which is off on free —
temporarily upgrade to Mail Lite (~€0.90/user) for one month to run imapsync, or use Zoho Export.

## Data migration (old MODX site → Medusa) — separate track

MODX (MySQL) and Medusa (Postgres) models are incompatible; migrate per entity via a script
hitting the **Medusa Admin API**:
- Products / categories → CSV import or API script (title, handle, description, variants, prices, weight, images)
- Customers → API (no passwords; customers reset)
- Orders (the ~102 historical) → **migrated, including Abandoned carts** (client wants everything kept).
  Script via Admin API: match each old order's items to new catalog variant, restore
  totals/currency/address/status, map miniShop2 statuses (New/Completed/Abandoned) → Medusa
  statuses; fallback custom line item when a product no longer exists. High-risk line — hours
  depend on how cleanly old items map to the new catalog; migrate *after* the catalog.
- Blog (80 posts) → HTML→Markdown into Keystatic
- Static pages (About, Contact, Privacy, Impressum) → Astro/Keystatic by hand
- **301 redirects**: build an old→new URL map to preserve SEO

## Rough monthly cost after migration

Hetzner CAX21 ~€7.5 + backups ~€1.5 + Zoho €0 + Resend €0 ≈ **~€9/mo**, vs €10–30 WaveCom shared.
