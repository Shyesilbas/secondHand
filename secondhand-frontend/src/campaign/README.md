# Campaigns UI Module

Seller-initiated promotional campaigns, discount percentage rules, and listing price recalculations.

## Architecture

- **`MyCouponsPage`:** Seller campaigns dashboard (`/campaigns`) where sellers create and track custom discount campaigns across their active listings.
- **`CreateCampaignModal`:** Modal dialog configuring campaign title, discount rate, start and end dates, and eligible listing selections.
- **`CampaignCard`:** Component representing active and scheduled seller campaigns with progress and status badges.
- **`refreshCampaignAffectedQueries`:** Synchronizes query caches across the application upon campaign mutations:
  - Invalidates `['campaigns']`, `['listings']`, `['similarListings']`, and `['myListings']`.
  - Removes stale listing detail queries (`['listings', 'detail']`) so prices refresh immediately upon next visit.

## Invariants

- **Seller Scoping:** Sellers can only attach campaigns to listings they own.
- **Immediate Price Propagation:** Because campaigns directly modify displayed catalog prices, saving or deleting a campaign triggers comprehensive listing cache invalidations across lists and showcases.
- **Restrained Styling:** Strict compliance with `.agents/skills/restrained-ui-design-standard/SKILL.md`: neutral card borders, clear tabular dates, semantic percentage badges, and zero emojis.

