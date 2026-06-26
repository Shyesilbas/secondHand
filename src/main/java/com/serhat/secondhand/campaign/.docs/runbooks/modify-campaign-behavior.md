# Modify Campaign Behavior

## Purpose
Execution instructions for adding new campaign fields, changing discount types, or updating the fetching/scheduler mechanisms.

## When to Load
- When adding a new field to `Campaign`.
- When adding a new `CampaignDiscountKind` (e.g., Fixed amount vs Percentage).
- When altering how active campaigns are loaded for pricing calculations.

## When NOT to Load
- When modifying the pricing engine logic directly (`pricing` domain).
- When adding a general UI campaign banner.

## Assumptions
- Real Estate and Vehicle listings cannot have seller campaigns.
- List projection fetching avoids mapping full collection fields to prevent N+1 issues.

## Procedure
1. If adding a new field or discount kind, update `CampaignDiscountKind`, `CampaignValidator`, and map through to the DTOs via `CampaignMapper`. Ensure `CampaignErrorCodes` are correctly utilized instead of throwing raw generic exceptions.
2. If modifying `CampaignService.loadActiveCampaignsForSellers`, do NOT use double collection `fetch join`. Use a 2-step `hydrateEligibleCollections` process to prevent SQL row explosion.
3. If updating the scheduler logic, make sure to keep bulk update statements instead of iterating and saving individually.

## Pitfalls
- Accidentally introducing a Cartesian product (Row Explosion) by using `JOIN FETCH` on multiple OneToMany/ManyToMany relationships in a single query.
- Forgetting to update `CampaignListProjection` when adding a new field that must be visible in list summaries.

## Related Files
- `src/main/java/com/serhat/secondhand/campaign/application/CampaignService.java`
- `src/main/java/com/serhat/secondhand/campaign/repository/CampaignRepository.java`
