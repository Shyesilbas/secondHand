# Listing Data Flows

## Purpose
Detailed documentation of the internal execution paths and data flows for listing creation, publishing, searching, filtering, and fee payment.

## When to Load
- When explicitly debugging a specific data flow in the listing domain.
- When needing to understand the exact sequence of method calls across the application layer.

## When NOT to Load
- When understanding high-level domain boundaries.
- When fixing isolated bugs in other domains.

## Assumptions
- Flows described here use a combination of Hexagonal Architecture, CQRS, and Rich Domain Models.

## Procedure (Data Flows)

### 1. İlan Oluşturma Akışı
`Client Request` -> `Controller` -> `Service` -> `AbstractListingService.createListing()` [Template Method]
- `userService.findById()`
- `mapRequestToEntity()`
- `resolveEntities()` (e.g. Cache lookups)
- `validate()` (ListingValidationEngine)
- `save()`

### 2. İlan Yayınlama Akışı
`ListingController` -> `ListingCommandService.publish()` -> `Listing.publish()` [Rich Domain] -> `ListingRepository.save()` -> `ApplicationEventPublisher` -> `Follow Module Listener`

### 3. İlan Arama ve Filtreleme
- Global Search uses `ListingSearchService.globalSearch()` with N+1 prevention (`JOIN FETCH l.seller`).
- Category filtering uses `GenericListingFilterService.filter()` with JPA Criteria API and dynamic fetching.
- Enrichment runs asynchronously via `CompletableFuture` to fetch reviews, campaigns, and favorites.

### 4. Görüntülenme Takibi Akışı
`ListingViewController` -> `ListingViewService.trackView()` [@Async]
- IP hashing, duplicate control (1-hour window), async save.

### 5. Fiyat Güncelleme Akışı (AOP)
Controller -> Service -> `@TrackPriceChange` -> Repository.save() -> `PriceHistoryAspect.recordPriceChange()` -> Notification logic.

## Pitfalls
- Breaking the `@Async` behavior in view tracking, causing request blocking.
- Adding synchronous enrichment calls instead of `CompletableFuture`.

## Related Files
- `src/main/java/com/serhat/secondhand/listing/application/common/ListingCommandService.java`
- `src/main/java/com/serhat/secondhand/listing/application/query/ListingSearchService.java`
