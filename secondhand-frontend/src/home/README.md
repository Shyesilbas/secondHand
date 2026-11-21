# Home & Marketing UI Module

Marketplace landing page, catalog discovery, trust assurances, seller highlights, and corporate about view.

> [!NOTE]
> **Backend Counterpart & Architecture Deep Dive:**
> - **Backend Module:** [`showcase`](../../../src/main/java/com/serhat/secondhand/showcase/README.md)
> - **Architecture Deep Dive:** [`docs/social-proof-and-urgency-metrics-architecture.md`](../../../docs/social-proof-and-urgency-metrics-architecture.md)

## 1. Overview & Purpose

The `home` module serves as the primary storefront and brand entry point for the marketplace. It orchestrates product discovery, trust guarantees, and merchant recruitment:
1. **Dynamic Marketplace Landing (`HomePage`):** Composed of modular marketing and product showcase sections designed for rapid discovery and low bounce rates.
2. **Guest Headline (`HeroSection`):** Shown to guests only: value proposition plus browse and sell links. Signed-in users get a screen-reader `h1` instead. Search lives in the header, not the hero.
3. **Curated Product Carousels:** Dynamic feeds for recently viewed listings (`RecentlyViewedSection`), showcase-boosted listings (`ShowcaseSection`), best-selling active listings across all categories (`BestSellersSection`, `GET /api/v1/listings/best-sellers`), and vetted top merchants (`GreatSellersSection`).
4. **Trust & Safety Assurances (`TrustExperienceSection`):** Visible educational sections detailing the escrow payment system, courier protection, and buyer dispute safeguards on `AboutPage`.
5. **Corporate & Policy Information (`AboutPage`):** Dedicated route detailing company background, escrow safety mechanisms, and contact channels.

## 2. Route Map & Entry Points

| Path | Page | Access |
|---|---|---|
| `/` | `HomePage` | Public |
| `/about` | `AboutPage` | Public |

## 3. Component Rules

- **Eager Route Loading:** `HomePage` and `AboutPage` are bundled in the core application bundle to ensure instantaneous First Contentful Paint (FCP) without lazy chunk delays.
- **Image Optimization:** Off-screen carousel items utilize native `loading="lazy"` and Cloudinary responsive width parameters to prevent initial bandwidth bottlenecks.

---

## 4. React Query Keys

Generated from code; the hook files are the source of truth.

| Query key | Defined in |
|---|---|
| `['listings', 'home', 'bestSellers', size, userId]` | `BestSellersSection.jsx` |
| `['greatSellersHome', limit]` | `GreatSellersSection.jsx` |
