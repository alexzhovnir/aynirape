# AyniRapé — Complete SEO Migration Plan & URL Redirect Specification

**Project:** Seamless Migration of `aynirape.com` from Legacy MODX to Modern Headless Stack (Astro Storefront + Medusa v2 Commerce Backend + Keystatic CMS).  
**Goal:** 100% Link Equity Preservation, Zero Broken Links (404), Seamless 301 Permanent Redirects, and Technical SEO Optimization.

---

## 1. Executive Summary & Core Objectives

During site migration, preserving search engine rankings, domain authority, backlink equity, and organic traffic is critical. This document defines:

1. **Complete URL Inventory**: Mapping every legacy URL (categories, products, blog articles, and static pages) to its exact destination in the new architecture.
2. **Special URL Handling**: Standardizing URL-encoded diacritics (e.g. `rap%c3%a9` / `rapé` -> `rape`) and region-prefixed routes (`/shop/...` -> `/{countryCode}/store/...`).
3. **HTTP 301 Redirect Rules**: Production-ready Caddy server rules for instantaneous web server-level redirects.
4. **Technical SEO Checklist**: Dynamic canonicals, 5-language `hreflang` setup (EN, FR, DE, ES, IT), XML sitemaps, OpenGraph cards, and Schema.org JSON-LD structured data.
5. **Post-Launch Verification & Indexing**: Quality assurance tests and Google Search Console monitoring workflows.

---

## 2. URL Architecture Comparison

| Entity | Legacy MODX Pattern | New Astro / Medusa Pattern | Redirect Type |
| :--- | :--- | :--- | :--- |
| **Store Homepage** | `https://aynirape.com/` | `https://aynirape.com/us` (via Middleware / Geo-IP) | 301 Permanent |
| **Product Category** | `https://aynirape.com/shop/{cat-slug}` | `https://aynirape.com/us/store/category/{cat-slug}` | 301 Permanent |
| **Product Page** | `https://aynirape.com/shop/{cat-slug}/{prod-slug}` | `https://aynirape.com/us/store/{prod-slug}` | 301 Permanent |
| **Blog Index** | `https://aynirape.com/blog` | `https://aynirape.com/blog` | 200 OK Direct |
| **Blog Article (EN)** | `https://aynirape.com/blog/{post-slug}` | `https://aynirape.com/blog/{post-slug}` | 200 OK Direct |
| **Blog Article (FR/DE/ES/IT)**| N/A | `https://aynirape.com/{lang}/blog/{post-slug}` | New Pages |
| **Static Pages** | `https://aynirape.com/{page-slug}` | `https://aynirape.com/us/{page-slug}` | 301 Permanent |

---

## 3. Production URL Mapping Inventory

### A. Product Categories (5 Categories)

| # | Legacy MODX URL | Target New URL | Status |
|---|:--- |:--- |:--- |
| 1 | `https://aynirape.com/shop/rape` | `https://aynirape.com/us/store/category/rap-e` | 301 Permanent |
| 2 | `https://aynirape.com/shop/tepi-and-kuripe` | `https://aynirape.com/us/store/category/tepi-and-kuripe` | 301 Permanent |
| 3 | `https://aynirape.com/shop/ornaments-and-decoration` | `https://aynirape.com/us/store/category/ornaments-and-decoration` | 301 Permanent |
| 4 | `https://aynirape.com/shop/aromatics` | `https://aynirape.com/us/store/category/aromatics` | 301 Permanent |
| 5 | `https://aynirape.com/shop/supplements` | `https://aynirape.com/us/store/category/supplements` | 301 Permanent |

---

### B. Products (44 Products)

| # | Product Name | Legacy MODX URL | Target New Storefront URL |
|---|:--- |:--- |:--- |
| 1 | Emburana | `/shop/rape/emburana` | `/us/store/emburana` |
| 2 | Nukini Sansara | `/shop/rape/nukini-sansara` | `/us/store/nukini-sansara` |
| 3 | Huni Kuin | `/shop/rape/huni-kuin` | `/us/store/huni-kuin` |
| 4 | Caboclo Paricá | `/shop/rape/caboclo-parica` | `/us/store/caboclo-parica` |
| 5 | Yawanawa Tsunu | `/shop/rape/yawanawa` | `/us/store/yawanawa` |
| 6 | Jaguar Applicator | `/shop/tepi-and-kuripe/jaguar` | `/us/store/jaguar` |
| 7 | Spiritual Cleanse I | `/shop/rape/spiritual-cleanse-i` | `/us/store/spiritual-cleanse-i` |
| 8 | Kuripe Jaguar Tamarind | `/shop/tepi-and-kuripe/kuripe-jaguar-tamarind` | `/us/store/kuripe-jaguar-tamarind` |
| 9 | Kuripe Wolf Sawo | `/shop/tepi-and-kuripe/kuripe-wolf-sawo` | `/us/store/kuripe-wolf-sawo` |
| 10 | Kuripe Colibri Crocodile | `/shop/tepi-and-kuripe/kuripe-colibri-crocodile` | `/us/store/kuripe-colibri-crocodile` |
| 11 | Kuripe Simple Sonokeling | `/shop/tepi-and-kuripe/kuripe-simple-sonokeling` | `/us/store/kuripe-simple-sonokeling` |
| 12 | Tepi Tamarind | `/shop/tepi-and-kuripe/tepi-tamarind` | `/us/store/tepi-tamarind` |
| 13 | Tepi Bamboo Small | `/shop/tepi-and-kuripe/tepi-bamboo-small` | `/us/store/tepi-bamboo-small` |
| 14 | Kuripe Eagle Tamarind | `/shop/tepi-and-kuripe/kuripe-eagle-tamarind` | `/us/store/kuripe-eagle-tamarind` |
| 15 | Kuripe Snake Hibiscus | `/shop/tepi-and-kuripe/kuripe-snake-hibiscus` | `/us/store/kuripe-snake-hibiscus` |
| 16 | Tepi Sonokeling | `/shop/tepi-and-kuripe/tepi-sonokeling` | `/us/store/tepi-sonokeling` |
| 17 | Tepi Hibiscus | `/shop/tepi-and-kuripe/tepi-hibiscus` | `/us/store/tepi-hibiscus` |
| 18 | Tepi Sawo | `/shop/tepi-and-kuripe/tepi-sawo` | `/us/store/tepi-sawo` |
| 19 | Kuripe Frog Sono | `/shop/tepi-and-kuripe/kuripe-frog-sono` | `/us/store/kuripe-frog-sono` |
| 20 | Kuripe Simple Tamarind | `/shop/tepi-and-kuripe/kuripe-simple-tamarind` | `/us/store/kuripe-simple-tamarind` |
| 21 | Kuripe Owl Teak | `/shop/tepi-and-kuripe/kuripe-owl-teak` | `/us/store/kuripe-owl-teak` |
| 22 | Kuripe Simple Sawo | `/shop/tepi-and-kuripe/kuripe-simple-sawo` | `/us/store/kuripe-simple-sawo` |
| 23 | Kuripe Turtle Hibiscus | `/shop/tepi-and-kuripe/kuripe-turtle-hibiscus` | `/us/store/kuripe-turtle-hibiscus` |
| 24 | Kuripe Simple Hibiscus | `/shop/tepi-and-kuripe/kuripe-simple-hibiscus` | `/us/store/kuripe-simple-hibiscus` |
| 25 | Ceremonial Carpet | `/shop/ornaments-and-decoration/ceremonial-carpet` | `/us/store/ceremonial-carpet` |
| 26 | Agua de Florida Cologne | `/shop/aromatics/agua-de-florida` | `/us/store/agua-de-florida` |
| 27 | Palo Santo Sticks | `/shop/aromatics/palo-santo` | `/us/store/palo-santo` |
| 28 | Guaraná Seed Powder | `/shop/supplements/guarana-powder` | `/us/store/guarana-powder` |
| 29 | Blue Lotus Flowers | `/shop/supplements/blue-lotus-flowers` | `/us/store/blue-lotus-flowers` |
| 30 | Maca Root Powder | `/shop/supplements/maca-powder` | `/us/store/maca-powder` |
| 31 | Rapé Sample Set 3x5g | `/shop/rape/rape-sample-set-3x5g` | `/us/store/rape-sample-set-3x5g` |
| 32 | Rapé Sample Set 6x5g | `/shop/rape/rape-sample-set-6x5g` | `/us/store/rape-sample-set-6x5g` |
| 33 | Kuntanawa Jarina | `/shop/rape/kuntanawa-jarina` | `/us/store/kuntanawa-jarina` |
| 34 | Nukini Rosa Branca | `/shop/rape/nukini-rosa-branca` | `/us/store/nukini-rosa-branca` |
| 35 | Mulateiro | `/shop/rape/mulateiro` | `/us/store/mulateiro` |
| 36 | Shamanic Cleanse II | `/shop/rape/shamanic-cleanse-ii` | `/us/store/shamanic-cleanse-ii` |
| 37 | Canela de Velho | `/shop/rape/canela-de-velho` | `/us/store/canela-de-velho` |
| 38 | Cacau | `/shop/rape/cacau` | `/us/store/cacau` |
| 39 | Tsunu | `/shop/rape/tsunu` | `/us/store/tsunu` |
| 40 | Kuntanawa Sananga | `/shop/rape/kuntanawa-sananga` | `/us/store/kuntanawa-sananga` |
| 41 | Sananga Eye Drops | `/shop/rape/sananga` | `/us/store/sananga` |
| 42 | Veia de Pajé | `/shop/rape/veia-de-pajé` | `/us/store/veia-de-paje` |
| 43 | Murici | `/shop/rape/murici` | `/us/store/murici` |
| 44 | Jurema | `/shop/rape/jurema` | `/us/store/jurema` |

---

### C. Blog Articles & Encoding Normalization (18 Articles / 90 Localized Content Files)

| Legacy MODX URL Variants | Canonical Target URL | Languages Available |
|:--- |:--- |:--- |
| `/blog/rape-ritual-preparation` <br> `/blog/rap%c3%a9-ritual-preparation` <br> `/blog/rapé-ritual-preparation` | `/blog/rape-ritual-preparation` | EN, DE, ES, FR, IT |
| `/blog/rape-ritual-preparation-how-to-set-intention-before-ceremony` <br> `/blog/rap%c3%a9-ritual-preparation-how-to-set-intention-before-ceremony` | `/blog/rape-ritual-preparation-how-to-set-intention-before-ceremony` | EN, DE, ES, FR, IT |
| `/blog/tepi-vs-kuripe-whats-the-difference-and-which-rape-applicator-should-you-choose` <br> `/blog/tepi-vs-kuripe-whats-the-difference-and-which-rap%c3%a9-applicator-should-you-choose` | `/blog/tepi-vs-kuripe-whats-the-difference-and-which-rape-applicator-should-you-choose` | EN, DE, ES, FR, IT |
| `/blog/8-powerful-acupressure-points-for-headache-relief-in-2026` | `/blog/8-powerful-acupressure-points-for-headache-relief-in-2026` | EN, DE, ES, FR, IT |
| `/blog/agua-de-florida-cologne-guide` | `/blog/agua-de-florida-cologne-guide` | EN, DE, ES, FR, IT |
| `/blog/agua-de-florida-cologne-what-it-is-and-how-to-use-it-in-spiritual-and-daily-rituals` | `/blog/agua-de-florida-cologne-what-it-is-and-how-to-use-it-in-spiritual-and-daily-rituals` | EN, DE, ES, FR, IT |
| `/blog/benefits-and-side-effects-of-guarana-seed-powder-what-you-should-know` | `/blog/benefits-and-side-effects-of-guarana-seed-powder-what-you-should-know` | EN, DE, ES, FR, IT |
| `/blog/blue-lotus-flower-ceremonial-wisdom` | `/blog/blue-lotus-flower-ceremonial-wisdom` | EN, DE, ES, FR, IT |
| `/blog/creating-sacred-space-why-a-ceremonial-carpet-is-essential-for-your-altar` | `/blog/creating-sacred-space-why-a-ceremonial-carpet-is-essential-for-your-altar` | EN, DE, ES, FR, IT |
| `/blog/how-to-clean-and-care-for-your-tepi-and-kuripe-applicators` | `/blog/how-to-clean-and-care-for-your-tepi-and-kuripe-applicators` | EN, DE, ES, FR, IT |
| `/blog/how-to-clean-tepi-kuripe` | `/blog/how-to-clean-tepi-kuripe` | EN, DE, ES, FR, IT |
| `/blog/maca-root-powder-benefits-uses-and-how-to-take-it-safely` | `/blog/maca-root-powder-benefits-uses-and-how-to-take-it-safely` | EN, DE, ES, FR, IT |
| `/blog/palo-santo-energy-cleansing` | `/blog/palo-santo-energy-cleansing` | EN, DE, ES, FR, IT |
| `/blog/sacred-blue-lotus-flower-a-guide-to-its-ceremonial-wisdom` | `/blog/sacred-blue-lotus-flower-a-guide-to-its-ceremonial-wisdom` | EN, DE, ES, FR, IT |
| `/blog/tepi-vs-kuripe-applicator-guide` | `/blog/tepi-vs-kuripe-applicator-guide` | EN, DE, ES, FR, IT |
| `/blog/the-spiritual-significance-of-amethyst-in-shamanic-rituals` | `/blog/the-spiritual-significance-of-amethyst-in-shamanic-rituals` | EN, DE, ES, FR, IT |
| `/blog/what-are-palo-santo-sticks-and-how-to-use-them-for-energy-cleansing` | `/blog/what-are-palo-santo-sticks-and-how-to-use-them-for-energy-cleansing` | EN, DE, ES, FR, IT |
| `/blog/what-are-shamanic-tools-and-how-to-use-them-correctly` | `/blog/what-are-shamanic-tools-and-how-to-use-them-correctly` | EN, DE, ES, FR, IT |

---

### D. Static Pages & Utility Routes

| Legacy MODX Path | Target New Path | Status Code |
|:--- |:--- |:--- |
| `/` | `/us` | 301 Permanent Redirect (Middleware handles geo-routing) |
| `/about` | `/us/about` | 301 Permanent Redirect |
| `/contact` | `/us/contact` | 301 Permanent Redirect |
| `/delivery-and-payment` | `/us/delivery-and-payment` | 301 Permanent Redirect |
| `/impressum` | `/us/impressum` | 301 Permanent Redirect |
| `/privacy-policy` | `/us/privacy-policy` | 301 Permanent Redirect |
| `/privacy` | `/us/privacy` | 301 Permanent Redirect |
| `/terms` | `/us/terms` | 301 Permanent Redirect |
| `/cart` | `/us/cart` | 301 Permanent Redirect |
| `/checkout` | `/us/checkout` | 301 Permanent Redirect |

---

## 4. Production Caddy Redirect Snippet

Place the following rules in your Hetzner VPS `Caddyfile` for optimal speed (redirects occur at the web server layer before reaching Docker containers):

```caddy
aynirape.com {
    # 1. Normalize Rapé encoded blog URLs
    @blog_rape_encoded path_regexp blog_enc ^/blog/.*(rap%c3%a9|rapé).*$
    redir @blog_rape_encoded /blog/rape-ritual-preparation-how-to-set-intention-before-ceremony 301

    # 2. Redirect Products: /shop/{category}/{product-handle} -> /us/store/{product-handle}
    @legacy_product path_regexp prod ^/shop/[^/]+/(.+)$
    redir @legacy_product /us/store/{re.prod.1} 301

    # 3. Redirect Categories: /shop/{category-handle} -> /us/store/category/{category-handle}
    # Special category mapping for rap-e
    redir /shop/rape /us/store/category/rap-e 301
    @legacy_category path_regexp cat ^/shop/([^/]+)/?$
    redir @legacy_category /us/store/category/{re.cat.1} 301

    # 4. Redirect Legacy Static Pages to Default Country Scope (/us)
    redir /about /us/about 301
    redir /contact /us/contact 301
    redir /delivery-and-payment /us/delivery-and-payment 301
    redir /impressum /us/impressum 301
    redir /privacy-policy /us/privacy-policy 301
    redir /terms /us/terms 301

    # Main reverse proxy to Astro Storefront
    reverse_proxy localhost:4321
}
```

---

## 5. Technical SEO Audit & Checklist

### A. Canonical Links
Every page layout rendered in Astro must output:
```html
<link rel="canonical" href="https://aynirape.com/current-canonical-path" />
```

### B. Internationalization & Hreflang Tags
For blog articles and products available in multiple languages (`en`, `de`, `es`, `fr`, `it`):
```html
<link rel="alternate" hreflang="x-default" href="https://aynirape.com/blog/article-slug" />
<link rel="alternate" hreflang="en" href="https://aynirape.com/blog/article-slug" />
<link rel="alternate" hreflang="de" href="https://aynirape.com/de/blog/article-slug" />
<link rel="alternate" hreflang="es" href="https://aynirape.com/es/blog/article-slug" />
<link rel="alternate" hreflang="fr" href="https://aynirape.com/fr/blog/article-slug" />
<link rel="alternate" hreflang="it" href="https://aynirape.com/it/blog/article-slug" />
```

### C. Structured Data (Schema.org JSON-LD)
1. **Product Schema**: On product pages (`/us/store/[productId]`), include `@type: "Product"`, `name`, `image`, `description`, `sku`, and `offers` (`price`, `priceCurrency`, `availability`).
2. **Article Schema**: On blog pages (`/blog/[slug]`), include `@type: "BlogPosting"`, `headline`, `image`, `datePublished`, `author`.
3. **Breadcrumbs Schema**: Include `BreadcrumbList` on category and product detail pages.

### D. XML Sitemap & Robots.txt
- Automatically generate `/sitemap.xml` containing all active 200/OK URLs.
- Configure `/robots.txt` to point to `Sitemap: https://aynirape.com/sitemap.xml` and disallow non-indexable paths (`/checkout`, `/cart`, `/keystatic`).

---

## 6. Post-Migration Quality Assurance & Monitoring Workflow

1. **Automated Redirect Audit**: Execute `curl -I` on all 44 products, 5 categories, 18 blog posts, and 10 static pages to confirm `HTTP/1.1 301 Moved Permanently` headers and valid `Location:` destinations.
2. **Google Search Console Resubmission**:
   - Resubmit `sitemap.xml`.
   - Use URL Inspection Tool to request re-indexing of key landing pages (`/`, `/blog`, top products).
3. **404 Log Monitoring**: Monitor Caddy access logs for 404 errors during the first 30 days to catch any obscure incoming links or bookmarks.
