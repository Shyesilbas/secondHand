# Modify Listing UI

## Purpose
Provides instructions for adding new filters, changing search behavior, updating sorting options, or modifying listing cards.

## When to Load
- When adding a new filter field to the listing sidebar.
- When modifying the grid or pagination logic.
- When fixing inconsistent search results or stale UI states on a listing card.

## When NOT to Load
- When changing the layout of the homepage.
- When modifying backend pricing or campaigns.

## Assumptions
- Listing filters are serialized by `listingService.js` before being sent to the API.
- Re-rendering listing cards is strictly controlled by memo comparators to optimize performance.

## Procedure
1. **Adding a Filter:** Add to `filters/filterConfigs.js`, then update `serializeFilters` inside `listingService.js`. Update `hooks/utils/filterDefaults.js` if necessary.
2. **Search Issues:** If the search returns stale or inconsistent data, verify that `titleSearchRequestRef` correctly aborts or ignores outdated requests inside `useListingSearch.js`.
3. **Card Stale State:** If a `ListingCard` does not update, ensure its internal comparator checks the new prop fields. If the calculation is heavy (like showcase checks), calculate it at the `ListingGrid` level and pass it as a simple boolean to the card.
4. **New Sorting:** Extend `LISTING_SORT_FIELDS` in `types/index.js` and ensure it matches the backend expectation.

## Pitfalls
- Adding a filter to the UI but forgetting to serialize it in `serializeFilters`.
- Adding new magic numbers instead of using `LISTING_DEFAULTS`.

## Related Files
- `src/listing/hooks/useListingSearch.js`
- `src/listing/services/listingService.js`
