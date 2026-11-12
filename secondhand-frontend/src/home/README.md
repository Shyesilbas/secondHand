# Home & Marketing UI Module

Marketplace landing page, catalog discovery, trust assurances, seller highlights, and corporate about view.

---

## 1. Overview & Purpose

The `home` module serves as the primary storefront and brand entry point for the marketplace. It orchestrates product discovery, trust guarantees, and merchant recruitment:
1. **Dynamic Marketplace Landing (`HomePage`):** Composed of modular marketing and product showcase sections designed for rapid discovery and low bounce rates.
2. **Search & Category Shortcuts (`HeroSection`):** High-prominence search input, popular search suggestions, and direct shortcuts to the six catalog verticals.
3. **Trust & Safety Assurances (`TrustBand`, `TrustExperienceSection`):** Visible educational sections detailing the escrow payment system, courier protection, and buyer dispute safeguards.
4. **Curated Product Carousels:** Dynamic feeds for showcase-boosted listings (`ShowcaseSection`), newly arrived listings (`NewListingsSection`), and vetted top merchants (`GreatSellersSection`).
5. **Corporate & Policy Information (`AboutPage`):** Dedicated route detailing company background, escrow safety mechanisms, and contact channels.

---

## 2. Route Map & Entry Points

| Route | Guard / Access | Component | Purpose & Query Params |
|---|---|---|---|
| `/` | Public | `HomePage` | Primary landing page of the application; eagerly loaded for maximum performance. |
| `/about` | Public | `AboutPage` | Platform overview, mission statement, and corporate policies. |

---

## 3. Component Hierarchy & Core Sub-Components

```
home/
├── pages/
│   ├── HomePage.jsx                   # Eagerly loaded master landing page
│   └── AboutPage.jsx                  # Corporate overview and safety disclosures
├── components/
│   ├── HeroSection.jsx                # Search bar, category pill icons, and tagline
│   ├── TrustBand.jsx                  # 3-pillar confidence strip (Escrow, Delivery, Verification)
│   ├── ShowcaseSection.jsx            # Boosted paid showcase listings carousel
│   ├── NewListingsSection.jsx         # Recently published products grid
│   ├── GreatSellersSection.jsx        # Carousel highlighting vetted high-reputation sellers
│   ├── MarketplaceStatsSection.jsx    # Platform statistics (active items, volume, members)
│   ├── TrustExperienceSection.jsx     # Step-by-step visual breakdown of the escrow lifecycle
│   ├── SellerCtaSection.jsx           # Merchant conversion banner prompting listing creation
│   ├── HomeSection.jsx                # Standardized section wrapper with title and action link
│   ├── GreatSellerRulesCallout.jsx    # Educational tooltip detailing Great Seller criteria
│   ├── homeLayout.js                  # Shared section grid spacing and container definitions
│   └── greatSellerPolicyCopy.js       # Localized criteria copy for seller qualification
└── README.md                          # Module architecture specification
```

### Component Roles & Invariants
- **Eager Route Loading:** `HomePage` and `AboutPage` are bundled in the core application bundle to ensure instantaneous First Contentful Paint (FCP) without lazy chunk delays.
- **Image Optimization:** Off-screen carousel items utilize native `loading="lazy"` and Cloudinary responsive width parameters to prevent initial bandwidth bottlenecks.
- **Dynamic Category Navigation:** Clicking category pills in `HeroSection` redirects to `/listings` with the selected vertical pre-filtered.

---

## 4. State Management & React Query Contract

### Query Keys & Cache Matrix
| Query Key | Scope | Stale Time | Garbage Collection | Invalidation Triggers |
|---|---|---|---|---|
| `['listings', 'showcase']` | Boosted showcase listings carousel | 5 min (`300000ms`) | 15 min (`900000ms`) | Showcase slot updates |
| `['listings', 'newest']` | Recently published listings stream | 2 min (`120000ms`) | 10 min (`600000ms`) | New listing published |
| `['sellers', 'greatSellers']` | Highlighted top sellers list | 10 min (`600000ms`) | 30 min (`1800000ms`) | Reputation recalculation |
| `['marketplace', 'stats']` | Platform aggregate counts | 15 min (`900000ms`) | 60 min (`3600000ms`) | Hourly batch cache |

---

## 5. Form & Data Validation Rules

- **Hero Search Input:** Trimmed string (1-100 characters). Submitting triggers navigation to `/listings?q={query}`.

---

## 6. UX States, Backend Error Contract & Restrained Design Tokens

### 4-State UX Handling
1. **Loading State:** Landing carousels and product grids display skeleton card placeholders (`SkeletonCard`) matching real card dimensions.
2. **Empty State:** If showcase slots are vacant, `ShowcaseSection` seamlessly hides itself or renders a clean callout inviting sellers to boost listings.
3. **Error State:** If external feeds fail, non-critical sections degrade silently without crashing the primary landing page shell.
4. **Data State:** Rich discovery experience with product cards, seller badges, search triggers, and trust banners.

### Backend Error Contract
- Section-level error boundaries isolate errors so failure of one promotional endpoint does not impact the rest of `HomePage`.

### Restrained Design Tokens
- **Backgrounds:** Alternating clean neutral backgrounds (`bg-background` and `bg-surface-alt/40`) to define section boundaries without loud colors.
- **Trust Elements:** Trust icons use muted slate or primary accents; zero celebratory emojis or flashing sales banners.
- **Radii:** Standard `rounded-md` across all cards, banners, and search inputs.
