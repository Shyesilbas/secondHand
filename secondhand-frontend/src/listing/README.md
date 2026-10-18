# Listing UI Module

Catalog presentation: filtering, grid, pagination and multi-mode search.

## Architecture
- `useListingEngine`: orchestrates filters, search and fetching.
- `useListingSearch`: tracks a request id so stale responses never overwrite newer results.
- `services/listingService.js`: serializes filter state (`serializeFilters`) into backend payloads.

## Invariants
- Adding a filter: add it to `filters/filterConfigs.js`, then to `serializeFilters` (and `hooks/utils/filterDefaults.js` if it needs a default). A filter missing from `serializeFilters` is silently ignored.
- Never coerce undefined filter values to defaults like `0`.
- New sort options extend `LISTING_SORT_FIELDS` in `types/index.js` and must match the backend. Use `LISTING_DEFAULTS` instead of magic numbers.
- `ListingCard` uses a strict memo comparator: new props must be added to it. Heavy per-listing computation (e.g. showcase checks) is done in `ListingGrid` and passed down as plain props.
