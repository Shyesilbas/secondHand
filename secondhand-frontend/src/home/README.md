# Home & Marketing UI Module

Platform landing page, marketplace discovery, trust assurances, and about view.

## Architecture

- **`HomePage`:** Root landing page (`/`) assembled from modular marketing and catalog sections:
  - `HeroSection`: Prominent search input, dynamic category pills, and quick-filter prompts.
  - `TrustBand`: Three-pillar confidence strip highlighting buyer protection, escrow security, and verified members.
  - `ShowcaseSection`: Real-time showcase grid displaying actively boosted listings.
  - `NewListingsSection`: Recently published products across all categories.
  - `GreatSellersSection`: Carousel highlighting vetted sellers meeting Great Seller criteria.
  - `MarketplaceStatsSection`: Aggregated marketplace metrics (active listings, transactions, registered members).
  - `TrustExperienceSection`: Visual step-by-step breakdown of the escrow payment and delivery protection lifecycle.
  - `SellerCtaSection`: Conversion banner inviting visitors to list their pre-owned items.
- **`AboutPage`:** Information view (`/about`) outlining platform mission, security architecture, marketplace rules, and corporate contact details.

## Invariants

- **Eager Loading:** `HomePage` and `AboutPage` are critical landing routes and are eagerly loaded without lazy Suspense delay.
- **Performance:** Heavy carousel and grid sections utilize responsive lazy-loading and thumbnail image optimizations.
- **Restrained Styling:** Strict compliance with `.agents/skills/restrained-ui-design-standard/SKILL.md`: purposeful typography, muted neutral backgrounds, balanced spacing, and zero promotional emojis.

