# Campaign Domain

## Purpose
The `campaign` domain allows sellers to create, manage, and apply discount campaigns (percentage or fixed) to their active listings, subject to category rules and expiration dates.

## Architecture Overview
- **CampaignService:** Manages the CRUD lifecycle and validates ownership. Features a specialized hydration mechanism (`hydrateEligibleCollections`) for loading active campaigns without causing SQL cartesian products.
- **CampaignScheduler:** Periodically deactivates campaigns whose `endsAt` date has passed.
- **CampaignValidator:** Enforces strict domain rules regarding discount limits and listing eligibility.

## Business Invariants & Constraints
- **Discount Integrity:** A `PERCENT` campaign value must be <= 100. Any campaign value must be > 0. Date constraints (`startsAt < endsAt`) are strictly enforced.
- **Category Prohibition:** Campaigns cannot be applied to `REAL_ESTATE` or `VEHICLE` listings.
- **Ownership:** A seller can only apply campaigns to listings they explicitly own.
- **Scope (`ListingCampaignPricingUtil.isApplicable`):** Picked listings → only those listings; listing types → any listing of those types, including ones created later; no filter → all campaignable listings. `applyToFutureListings` never widens a picked-listings campaign.

## State Machines
- **Campaign State:** Active -> Inactive (Expired / Deactivated).

## Integration Points
- **Incoming:** HTTP requests from sellers via `CampaignController` and public shoppers via `PublicCampaignController`.
- **Outgoing:** The `pricing` domain queries this domain to fetch active campaigns for a given seller's items during checkout.

## Public APIs
- `POST /api/v1/seller/campaigns`: Creates a new campaign for seller's eligible listings.
- `PUT /api/v1/seller/campaigns/{id}`: Updates an existing campaign.
- `DELETE /api/v1/seller/campaigns/{id}`: Deletes or cancels a seller campaign.
- `GET /api/v1/seller/campaigns`: Lists campaigns belonging to the authenticated seller.
- `GET /api/v1/campaigns/active`: Publicly lists all currently active marketplace campaigns.

## Related Knowledge
- **Modify Campaign Behavior**
  -> `.docs/runbooks/modify-campaign-behavior.md`
