# Listing UI Module

> [!NOTE]
> **Backend Counterpart & Architecture Deep Dive:**
> - **Backend Module:** [`listing`](../../../src/main/java/com/serhat/secondhand/listing/README.md)
> - **Architecture Deep Dive:** [`docs/catalog-and-category-polymorphism.md`](../../../docs/catalog-and-category-polymorphism.md)
> - **Architecture Deep Dive:** [`docs/social-proof-and-urgency-metrics-architecture.md`](../../../docs/social-proof-and-urgency-metrics-architecture.md)

## 1. Executive Summary & Route Map

| Path | Page | Access |
|---|---|---|
| `/listings` | `ListingsPage` | Public |
| `/listings/:id` | `ListingDetailPage` | Public |
| `/listings/:id/edit` | `EditListingPage` | Protected |
| `/listings/create` | `CreateListingPage` | Protected |
| `/listings/prefilter` | `ListingsPrefilterPage` | Public |
| `/my-listings` | `MyListingsPage` | Protected |

## 2. React Query Keys

Generated from code; the hook files are the source of truth.

| Query key | Defined in |
|---|---|
| `LISTING_KEYS.detail(listingId)` | `useListingData.js` |
| `STATISTICS_KEYS.listing()` | `useListingStatistics.js` |
| `['exchangeRate', currency, selected]` | `ExchangeRatesTab.jsx` |
| `['listings', 'byNo', searchUpper]` | `useListingSearch.js` |
| `['listings', 'edit', id]` | `EditListingPage.jsx` |
| `['listings', 'priceHistory', listingId]` | `usePriceHistory.js` |
| `['similarListings', currentListing.id, currentListing.type, currentListing.city]` | `SimilarListings.jsx` |

| Invalidated / updated key | By |
|---|---|
| `LISTING_KEYS.detail(id)` | `EditListingPage.jsx` |
| `['listings']` | `EditListingPage.jsx` |

## 3. Form & Dynamic Attribute Engine

### Polymorphic Form Architecture
- Form fields dynamically assemble based on `categoryConfig` matching the selected vertical (`vehicleConfig`, `electronicsConfig`, `realEstateConfig`, `booksConfig`, `clothingConfig`, `sportsConfig`).
- Type rules (`REQUIRED`, `OPTIONAL`, `HIDDEN`) derived from backend `/api/v1/enums/all` determine which spec fields appear.

### Dynamic Attributes (`listings.attributes`)
- Attributes configured in `listing_attribute_definitions` render via `<ListingAttributeSection>`.
- Vehicle damage states render via `<DamageMapField>`, serializing painted/replaced part states into the attributes JSON.
- Empty attribute values are dropped before form submission; updates send the full attribute map.

### Publishing Flow & Fee Settlement
- `GenericListingForm` submits with intent `DRAFT` or `PUBLISH`; a draft returns to `/my-listings`.
- Publishing a new listing (or a draft) always continues to `/payments/listing-fee?listingId=<id>` (`ROUTES.PAY_LISTING_FEE`).
