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
- Listing form last step: a new listing, and an edited `DRAFT` listing (e.g. the copy made by "Tekrar yayınla" / relist), offer "Taslak olarak kaydet" and "Şimdi yayınla". Publishing saves, then opens the listing fee page with `?listingId=`. Editing a non-draft listing only offers "Değişiklikleri kaydet". `EditListingPage` passes `isDraft` and leaves toasts and navigation to the form.
- `ListingCard` uses a strict memo comparator: new props must be added to it. Heavy per-listing computation (e.g. showcase checks) is done in `ListingGrid` and passed down as plain props.
- Listing attributes (`listing.attributes`, backend `listing_attribute_definitions`): a form or detail section with `kind: 'attributes'` and `definitionsQuery(ctx | listing)` (React Query options) is rendered by `components/attributes/` (form inputs incl. the ENUM_MAP damage map, review rows, detail tab shown only when answered). Answers live in `formData.attributes`; empty answers are dropped before sending and the update payload always sends the whole map (the backend replaces it). Vehicles: definitions per vehicle type from `/v1/catalog/vehicle/attributes`, cleared when the type changes.
- Filter fields may take `getOptions(filters, enums)` to narrow an enum list and `visibleWhen(filters, enums)`; vehicle filters use the selected types' `fieldRules` / `bodyTypes` and narrow brands and models by type, keeping options the user already picked.
