# Listing UI Module

## 1. Executive Summary & Route Map
The `listing` module forms the marketplace's visual catalog core. It manages the multi-faceted search grid, prefilter selector, listing creation wizard, edit workflows, seller catalog management, real-time social proof indicators, and unified listing detail views across all 6 product categories.

### Route Map
| Route Path | Component | Access | Lazy Loaded | Purpose |
|---|---|---|---|---|
| `/listings` | `ListingsPage` | `Public` | Yes | Main catalog search, category tabs, filter sidebar, dynamic grid |
| `/listings/prefilter` | `ListingsPrefilterPage` | `Public` | Yes | Interactive category selection funnel before entering catalog |
| `/listings/:id` | `ListingDetailPage` | `Public` | Yes | Full product details, image gallery, buy-box, price history, reviews |
| `/listings/create` | `CreateListingPage` | `Protected` | Yes | Multi-step polymorphic listing publishing wizard |
| `/listings/edit/:id` | `EditListingPage` | `Protected` | Yes | Modification view for draft and active listings |
| `/profile/my-listings` | `MyListingsPage` | `Protected` | Yes | Seller catalog management (drafts, active, sold, relisting) |

---

## 2. Component Hierarchy & File Structure

```
src/listing/
├── pages/
│   ├── ListingsPage.jsx                # Main catalog page with sidebar, sort bar, and grid
│   ├── ListingDetailPage.jsx           # Single item detail view with tabs and sticky buy-box
│   ├── CreateListingPage.jsx           # Polymorphic wizard wrapper
│   ├── EditListingPage.jsx             # Edit flow container with draft state detection
│   ├── MyListingsPage.jsx              # Seller catalog manager with tabbed statuses
│   └── ListingsPrefilterPage.jsx       # Category/type selection step
├── components/
│   ├── FilterSidebar.jsx               # Dynamic filter panel (category-driven facets)
│   ├── ListingGrid.jsx                 # Responsive card grid with layout toggle
│   ├── ListingCard.jsx                 # High-performance memoized item card
│   ├── ListingCardActions.jsx          # Context menu actions (Edit, Deactivate, Delete, Boost)
│   ├── ListingBuyBox.jsx               # Sticky purchase box (Add to Cart, Make Offer, Safe Meetup)
│   ├── ListingGallery.jsx              # Multi-image viewer with thumbnail strip and lightbox
│   ├── GenericListingForm.jsx          # Rule-driven polymorphic form builder
│   ├── ListingWizard.jsx               # Step progression for listing creation
│   ├── PriceHistoryTab.jsx             # Chronological price drop tracker with percent change
│   ├── ExchangeRatesTab.jsx            # Live multi-currency conversion preview
│   ├── ViewStatisticsCard.jsx          # Owner-facing view counts and 24h visitor trends
│   ├── SimilarListings.jsx             # Recommendation carousel for related products
│   ├── SafeMeetupModal.jsx             # Safe Meetup info and handover explanation dialog
│   └── attributes/
│       ├── ListingAttributeSection.jsx # Dynamic form section rendering extra JSONB attributes
│       ├── ListingAttributeDetails.jsx # Detail view tab displaying attributes
│       ├── ListingAttributeSummary.jsx # Compact key-value spec badge group
│       └── DamageMapField.jsx          # Interactive visual vehicle damage selector
├── hooks/
│   ├── useListingEngine.js             # Orchestrates search queries, filters, and URL sync
│   ├── useListingData.js               # Fetches single listing and resolves category snapshot
│   ├── useListingSearch.js             # Debounced search tracking request IDs to prevent race conditions
│   ├── useListingFilters.js            # Active filter chip management and serialization
│   ├── useListingActions.js            # Publish, deactivate, reactivate, and delete mutations
│   ├── useListingStatistics.js         # Owner view statistics fetcher
│   └── usePriceHistory.js              # Historical price changes query hook
├── services/
│   ├── listingService.js               # Raw Axios API calls (/api/v1/listings/**)
│   └── listingAddonService.js          # Price history, view tracking, and social proof calls
├── config/                             # Category configurations (vehicle, electronics, realEstate, books, clothing, sports)
└── README.md                           # Module documentation
```

---

## 3. React Query 5 Data Flow & Query Key Invalidation Matrix

### Query Key Topology
- `['listings', 'search', serializedFilters, page, sort]`: Main catalog search grid results.
- `['listings', 'detail', listingId]`: Complete single listing data.
- `['listings', 'my', { page, status }]`: Authenticated seller's own listings.
- `['listings', 'priceHistory', listingId]`: Chronological price adjustments.
- `['listings', 'socialProof', listingId]`: Active viewers (24h), cart users, favorite count.

### Invalidation Matrix
| Mutation Hook | Endpoint | Invalidated Query Keys | UX Impact |
|---|---|---|---|
| `publishListing` | `POST /api/v1/listings/{id}/publish` | `['listings', 'my']`, `['listings', 'detail', id]` | Moves listing from Draft to Active tab |
| `deactivateListing` | `POST /api/v1/listings/{id}/deactivate` | `['listings', 'my']`, `['listings', 'detail', id]`, `['listings', 'search']` | Removes item from public search |
| `reactivateListing` | `POST /api/v1/listings/{id}/reactivate` | `['listings', 'my']`, `['listings', 'detail', id]`, `['listings', 'search']` | Restores visibility |
| `deleteListing` | `DELETE /api/v1/listings/{id}` | `['listings', 'my']`, `['listings', 'search']` | Soft-deletes item from seller dashboard |
| `updateListing` | `PUT /api/v1/listings/{id}` | `['listings', 'detail', id]`, `['listings', 'my']` | Updates title, price, attributes, photos |

---

## 4. 4-State UX Handling Discipline

1. **Loading State:**
   - Catalog Grid: Displays `<ListingsSkeleton />` containing card skeletons matching grid dimensions.
   - Detail View: Renders skeleton boxes for gallery, buy-box, and specification tables.
2. **Empty State:**
   - Main Catalog Empty: Renders `<EmptyState>` with a search icon, "No listings found matching your criteria", and a "Clear Filters" action.
   - My Listings Empty: Displays empty state with a "Create First Listing" button.
3. **Error State:**
   - Displays dismissible `<Alert variant="error">` banners if search requests or mutations fail, unwrapping errors with `errorUtils.getErrorMessage(err)`.
4. **Disabled / Submitting State:**
   - In `ListingBuyBox`: "Add to Cart" and "Make Offer" are disabled when the listing is out of stock or reserved by another buyer.
   - In `GenericListingForm`: "Publish" button disables and shows a spinner while upload or validation is in flight.

---

## 5. Form & Dynamic Attribute Engine

### 5.1 Polymorphic Form Architecture
- Form fields dynamically assemble based on `categoryConfig` matching the selected vertical (`vehicleConfig`, `electronicsConfig`, `realEstateConfig`, `booksConfig`, `clothingConfig`, `sportsConfig`).
- Type rules (`REQUIRED`, `OPTIONAL`, `HIDDEN`) derived from backend `/api/v1/enums/all` determine which spec fields appear.

### 5.2 Dynamic Attributes (`listings.attributes`)
- Attributes configured in `listing_attribute_definitions` render via `<ListingAttributeSection>`.
- Vehicle damage states render via `<DamageMapField>`, serializing painted/replaced part states into the attributes JSON.
- Empty attribute values are dropped before form submission; updates send the full attribute map.

### 5.3 Publishing Flow & Fee Settlement
- Creating a listing saves it in `DRAFT` status.
- If the seller's plan quota requires a publishing fee, saving prompts the user and navigates directly to `/listings/pay-fee/:id`.
- If publishing is free under the user's tier, the item transitions directly to `ACTIVE`.

---

## 6. Backend Contract & Safe Error Handling
- Exceptions are unwrapped via `errorUtils.getErrorMessage(err)`:
  - `LISTING_NOT_FOUND` -> "The requested listing could not be found."
  - `LISTING_CANNOT_MUTATE_SOLD` -> "This listing has been sold and cannot be modified."
  - `ATTRIBUTE_REQUIRED` -> "Please fill in all mandatory category attributes."

---

## 7. Restrained Design Tokens & Anti-Patterns
- **Typography:** Prices use `font-mono tabular-nums text-lg font-semibold`.
- **Card Badges:** Category pills and condition badges use subtle neutral borders (`border-border-subtle`).
- **No Emojis:** Strictly prohibited across listing titles, cards, filter chips, and action menus.
- **Radius Ceiling:** Cards, gallery images, modals, and buttons adhere strictly to `rounded-md`.
