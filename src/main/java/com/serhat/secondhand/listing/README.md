# Listing Domain

Manages the 6-vertical polymorphic product catalog (`VehicleListing`, `ElectronicListing`, `RealEstateListing`, `BooksListing`, `ClothingListing`, `SportsListing` extending `Listing` via JPA joined inheritance), rule-driven attribute validation, deterministic spec snapshotting, price change history (`@TrackPriceChange`), and real-time view/social proof metrics.

> [!NOTE]
> **Related Documentation & Runbooks:**
> - **Architecture Deep Dive:** [`docs/catalog-and-category-polymorphism.md`](/docs/catalog-and-category-polymorphism.md) · [`docs/social-proof-and-urgency-metrics-architecture.md`](/docs/social-proof-and-urgency-metrics-architecture.md)
> - **Frontend Modules:** [`listing`](/secondhand-frontend/src/listing/README.md) · [`vehicle`](/secondhand-frontend/src/vehicle/README.md) · [`electronics`](/secondhand-frontend/src/electronics/README.md) · [`realEstate`](/secondhand-frontend/src/realEstate/README.md) · [`books`](/secondhand-frontend/src/books/README.md) · [`clothing`](/secondhand-frontend/src/clothing/README.md) · [`sports`](/secondhand-frontend/src/sports/README.md)
> - **Knowledge & Runbooks:** [`listing-data-flows.md`](.docs/knowledge/listing-data-flows.md) · [`listing-architecture-patterns.md`](.docs/knowledge/listing-architecture-patterns.md) · [`vehicle-catalog-sources.md`](.docs/knowledge/vehicle-catalog-sources.md)
> - **Key Entry Points:** [`AbstractListingService`](application/category/AbstractListingService.java) · [`ListingCommandService`](application/common/ListingCommandService.java) · [`ListingQueryService`](application/common/ListingQueryService.java) · [`ListingSearchService`](application/query/ListingSearchService.java) · [`ListingValidationEngine`](validation/common/ListingValidationEngine.java) · [`ListingSocialProofService`](application/common/ListingSocialProofService.java) · [`LocationCatalogService`](application/common/LocationCatalogService.java)

## Business Rules & Invariants
- **Joined Polymorphism & Rule-Driven Validation:** Base `listings` rows join to `vehicle_listings`, `electronic_listings`, `real_estate_listings`, `book_listings`, `clothing_listings`, and `sports_listings`. `ListingValidationEngine` runs location checks, category `CategorySpecValidator`s (`*TypeRulesValidator` + `*HierarchyValidator`), and `ListingAttributeValidator` (`listing_attribute_definitions` stored in `listings.attributes` JSONB with GIN index `idx_listings_attributes_gin`).
- **Deterministic Spec Snapshotters:** `VehicleSpecSnapshotter`, `ElectronicSpecSnapshotter`, and `BooksEditionSnapshotter` overwrite client inputs with non-null verified catalog facts on create and update; unlinked listings remain allowed as unverified.
- **Lifecycle & Price History (`ListingStatus`):** Transitions across `DRAFT`, `ACTIVE` (publishes `NewListingCreatedEvent`), `INACTIVE`, `RESERVED` (24h accepted offer hold), `SOLD`, and `DELETED`. Modifying `price` triggers `@TrackPriceChange` (`listing_price_histories`).
- **Moderation Takedowns:** `ListingModerationService` moves `ACTIVE` listings to `INACTIVE` for complaint sanctions without an owner check; it requires the caller's transaction.
- **Debounced Views & Social Proof:** `ListingViewService` records views asynchronously with IP/session/user debounce. `ListingSocialProofService` combines 24h active viewers, in-cart count, and favorite count in one payload.

## Redis & Caching
- Spring caches (`CacheConfig`, cleared by `CatalogSeedStartupRunner` / mutations): `catalog:*` (`catalog:brands`, `catalog:vehicleTypes`, `catalog:clothingTypes`, `catalog:electronicTypes`, `catalog:bookGenres`), `listing:userListings`, `listing:views:seller`, `listing:views:listing`.
- Redis keys: `v4:listing:active_viewers:{id}` (24h ZSET) and `v6:catalog:locations:*` (`LocationCatalogService`).

## API
- **Base (`ListingController`, `/api/v1/listings`):** `GET /` · `GET /{id}` · `POST /` · `PUT /{id}` · `DELETE /{id}` · `POST /{id}/{publish|deactivate|reactivate|sold|view}` · `GET /{id}/{view-stats|active-viewers|social-proof}`.
- **Verticals (`/api/v1/{vehicles|electronics|real-estates|books|clothings|sports}`):** `POST /create-listing` · `PUT /{id}` · `GET /{id}` · `POST /filter`.
- **Price History (`/api/v1/price-history/listing/{listing-id}`):** `GET /` · `GET /latest` · `GET /exists`.
