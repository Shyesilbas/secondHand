# Campaign Domain

Manages seller-created promotional discounts (`campaigns`, `campaign_eligible_types`, `campaign_eligible_listings`), eligibility rules, batch pricing hydration, and scheduled expiration (`CampaignScheduler`).

> [!NOTE]
> **Related Documentation & Runbooks:**
> - **Architecture Deep Dive:** [`docs/pricing-coupon-and-campaign-architecture.md`](/docs/pricing-coupon-and-campaign-architecture.md) (seller campaign selection, precedence before coupons)
> - **Frontend Module:** [`secondhand-frontend/src/campaign/README.md`](/secondhand-frontend/src/campaign/README.md)
> - **Key Entry Points:** [`CampaignController`](api/CampaignController.java) · [`PublicCampaignController`](api/PublicCampaignController.java) · [`CampaignService`](application/CampaignService.java) · [`ICampaignService`](application/ICampaignService.java) · [`CampaignValidator`](validator/CampaignValidator.java) · [`ListingCampaignPricingUtil`](../listing/util/ListingCampaignPricingUtil.java)

## Business Rules & Invariants
- **Ownership & Vertical Exclusion (`CampaignValidator`):** Sellers may only attach listings they own (`assertOwnedBySeller`, `CampaignErrorCodes.CAMPAIGN_NOT_OWNED`). `ListingType.REAL_ESTATE` and `ListingType.VEHICLE` are excluded.
- **Value & Time Bounds:** `CampaignDiscountKind.PERCENTAGE` requires `0 < value <= 100`; `FIXED_AMOUNT` requires `value > 0`; `startsAt` must precede `endsAt`.
- **Scope Hierarchy (`ListingCampaignPricingUtil.isApplicable`):**
  - If `eligibleListingIds` is non-empty, only those explicit listings qualify (`applyToFutureListings = true` never widens an explicit listing whitelist).
  - If `eligibleTypes` is non-empty, matching listings qualify (including future listings when `applyToFutureListings = true`).
  - Empty filters target all eligible listings of the seller.
- **Cartesian-Safe Batch Hydration:** `loadActiveCampaignsForSellers` runs separate projection queries (`findEligibleTypesByCampaignIds`, `findEligibleListingIdsByCampaignIds`) and hydrates sets in memory (`hydrateEligibleCollections`) to avoid multi-collection SQL join multiplication.
- **Soft Delete & Expiration:** Campaigns soft-delete via `@SQLDelete` (`deleted_at = now()`) and `@SQLRestriction("deleted_at IS NULL")`. `CampaignScheduler` bulk-deactivates expired rows (`campaignConfigProperties.schedulerDeactivateFixedDelayMs`).
- **Change rule:** New field or discount kind: update `CampaignDiscountKind`, `CampaignValidator`, `CampaignMapper` and, for list views, `CampaignListProjection`.
- **Change rule:** Expiry scheduler uses bulk `UPDATE`s, never per-row saves.

## Redis & Caching
- `create()`, `update()`, and `delete()` evict Spring cache `listing:userListings` (`@CacheEvict(value = "listing:userListings", allEntries = true)`).

## API
- **Seller (`CampaignController`, `/api/v1/seller/campaigns`):** `POST /` (`CreateCampaignRequest`) · `PUT /{id}` · `DELETE /{id}` · `GET /` (paginated).
- **Public (`PublicCampaignController`, `/api/v1/campaigns`):** `GET /active?sellerIds=` — active campaigns for storefront badges.
