# ADR-0002: Payment provider under the tobacco / high-risk constraint

**Status:** Proposed — **blocking for launch**
**Date:** 2026-07-10
**Deciders:** Alex Zhovnir (owner)

## Context

**Rapé is a tobacco snuff** — most blends contain *Nicotiana rustica* (mapacho).
Under the acceptable-use policies of the major processors, tobacco and nicotine
products are **prohibited**:

- **Stripe** — restricted business list includes tobacco/e-cigarettes/nicotine.
- **PayPal / Braintree** — tobacco restricted, especially cross-border.
- **Shopify Payments** — bans tobacco (a core reason we are **not** on Shopify,
  see [ADR-0001](ADR-0001-stack-and-topology.md)).

Getting this wrong is not a bug — it is **account termination and frozen funds**
mid-operation. It must be resolved **before** deep build-out, because it can change
integration work, region config, and even which markets we can ship to.

Additional wrinkles:
- **International shipping** of rapé/tobacco crosses jurisdictions with varying
  legality and import rules — a compliance question adjacent to, but separate from,
  payments.
- Existing prices are in **EUR**; the merchant is EU-facing → we need an EU-friendly
  high-risk acquirer or a merchant-of-record that explicitly accepts tobacco.

Because Medusa v2 is self-hosted, the **payment provider is a pluggable module** —
we are free to integrate whatever acquirer will underwrite this business. That
freedom is the whole point of ADR-0001.

## Decision

**Do not assume a mainstream processor.** Before build-out, secure a payment path
that *explicitly* permits tobacco/botanical snuff, then integrate it as a Medusa
payment module. Concretely:

1. Obtain a **high-risk merchant account** with an acquirer that underwrites
   tobacco/herbal-snuff (see options), **or** sell through a **merchant-of-record**
   that accepts the category and assumes the compliance/tax burden.
2. Get written confirmation of the category acceptance **before** integrating.
3. Keep Medusa's payment layer provider-agnostic so the choice is swappable.

This ADR does **not** yet name the final provider — it names the decision to treat
payments as a gated prerequisite and lists the candidates to validate.

## Options Considered

### Option A: High-risk merchant account + acquirer/gateway
Specialist high-risk acquirers underwrite tobacco/nicotine. In the EU this is the
realistic path for physical tobacco goods.
- **Pros:** built for this category; supports physical goods, EUR, international.
- **Cons:** higher fees & rolling reserves; underwriting/KYC takes time; you own
  chargeback and compliance exposure; may need a custom Medusa provider module.

### Option B: Merchant-of-record (MoR) that accepts the category
An MoR becomes the seller of record and handles payments, tax, and some compliance.
- **Pros:** offloads tax/VAT/compliance; simpler integration.
- **Cons:** **most mainstream MoRs (incl. Paddle) are digital-goods only and do
  not support physical tobacco** — a connected `paddle-sandbox` MCP is available in
  this workspace but Paddle is **not** a fit for physical rapé; treat it as unusable
  for this catalogue unless they confirm otherwise in writing. Finding a physical-
  goods MoR that accepts tobacco is itself the task.

### Option C: Mainstream processor (Stripe/PayPal) — **rejected**
- **Cons:** violates AUP; high risk of sudden account closure and frozen funds.
  Not viable for tobacco-containing rapé. Listed only to record that it was ruled out.

### Option D: Alternative rails (crypto / bank transfer / COD)
- **Pros:** sidesteps card-network category rules.
- **Cons:** high checkout friction, poor conversion, refund/dispute headaches;
  at best a **secondary** method, not the primary checkout.

## Trade-off Analysis

The real trade is **integration simplicity (MoR) vs. category acceptance (high-risk
acquirer)**. MoR is easier but the ones that accept physical tobacco are scarce;
a high-risk acquirer is more work and costlier but is purpose-built for exactly this
business. Given the catalogue is unavoidably tobacco, **category acceptance is the
gating requirement** — simplicity is secondary. Alternative rails can be added as a
fallback to reduce single-provider risk, but shouldn't be the primary path.

## Consequences

- **Easier:** once secured, a compliant, durable way to actually take money for a
  product mainstream processors won't touch.
- **Harder:** higher fees, reserves, and KYC; possibly a custom Medusa payment
  module; ongoing chargeback/compliance ownership.
- **Revisit when:** blend reformulation removes tobacco (would reopen Option C), a
  new market's import rules change viability, or an MoR begins accepting the category.

## Action Items

1. [ ] Confirm which SKUs contain tobacco/nicotine vs. tobacco-free botanical blends
   (changes which processors are even in scope).
2. [ ] Shortlist EU high-risk acquirers that underwrite tobacco/herbal snuff; get
   written category acceptance, fee schedule, and reserve terms.
3. [ ] Check for any physical-goods MoR that accepts tobacco (confirm in writing;
   **assume Paddle does not**).
4. [ ] Verify a Medusa v2 payment module exists for the chosen gateway, or scope
   building one.
5. [ ] Separately, review **international shipping legality** of rapé per target
   market (compliance, not payments — but can gate the same launch).
6. [ ] Decide primary vs. fallback methods (e.g. cards + bank transfer).
