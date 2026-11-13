# Home & Marketing UI Module

Marketplace landing page, catalog discovery, trust assurances, seller highlights, and corporate about view.

> [!NOTE]
> **Backend Counterpart & Architecture Deep Dive:**
> - **Backend Module:** [`showcase`](../../../src/main/java/com/serhat/secondhand/showcase/README.md)
> - **Architecture Deep Dive:** [`docs/social-proof-and-urgency-metrics-architecture.md`](../../../docs/social-proof-and-urgency-metrics-architecture.md)

## 1. Overview & Purpose

The `home` module serves as the primary storefront and brand entry point for the marketplace. It orchestrates product discovery, trust guarantees, and merchant recruitment:
1. **Dynamic Marketplace Landing (`HomePage`):** Composed of modular marketing and product showcase sections designed for rapid discovery and low bounce rates.
2. **Search & Category Shortcuts (`HeroSection`):** High-prominence search input, popular search suggestions, and direct shortcuts to the six catalog verticals.
3. **Trust & Safety Assurances (`TrustBand`, `TrustExperienceSection`):** Visible educational sections detailing the escrow payment system, courier protection, and buyer dispute safeguards.
4. **Curated Product Carousels:** Dynamic feeds for showcase-boosted listings (`ShowcaseSection`), newly arrived listings (`NewListingsSection`), and vetted top merchants (`GreatSellersSection`).
5. **Corporate & Policy Information (`AboutPage`):** Dedicated route detailing company background, escrow safety mechanisms, and contact channels.

## 2. Route Map & Entry Points

| Path | Page | Access |
|---|---|---|
| `/` | `HomePage` | Public |
| `/about` | `AboutPage` | Public |

## 3. Component Rules

- **Eager Route Loading:** `HomePage` and `AboutPage` are bundled in the core application bundle to ensure instantaneous First Contentful Paint (FCP) without lazy chunk delays.
- **Image Optimization:** Off-screen carousel items utilize native `loading="lazy"` and Cloudinary responsive width parameters to prevent initial bandwidth bottlenecks.
- **Dynamic Category Navigation:** Clicking category pills in `HeroSection` redirects to `/listings` with the selected vertical pre-filtered.

---

## 4. React Query Keys

Generated from code; the hook files are the source of truth.

| Query key | Defined in |
|---|---|
| `HOME_NEWEST_QUERY_KEY` | `NewListingsSection.jsx` |
| `['greatSellersHome', limit]` | `GreatSellersSection.jsx` |

## 5. Form & Data Validation Rules

- **Hero Search Input:** Trimmed string (1-100 characters). Submitting triggers navigation to `/listings?q={query}`.
