# Listing Architecture Patterns & Optimizations

## Purpose
Documents the specific design patterns (CQRS, Hexagonal, Strategy, Template Method) and performance optimizations (N+1 solutions, Caching) used within the Listing domain.

## When to Load
- When undertaking structural refactoring of the Listing domain.
- When adding a new category and needing to implement the correct structural patterns.

## When NOT to Load
- When fixing a standard logic bug.
- When implementing features in other domains.

## Assumptions
- New categories must strictly adhere to the Template Method and Strategy patterns.

## Design Patterns
- **Template Method Pattern:** `AbstractListingService` provides the base flow for creating/updating listings.
- **Strategy Pattern:** `ListingDetailService` generates text based on specific category strategies.
- **Chain of Responsibility:** `ListingValidationEngine` validates step-by-step.
- **Hexagonal Architecture (Ports & Adapters):** `ListingFeePaymentPort` connects to `PaymentModuleAdapter`.
- **CQRS:** `ListingCommandService` handles writes; `ListingQueryService` and `ListingSearchService` handle reads.
- **Rich Domain Model:** `Listing` entity encapsulates state-changing business rules (`publish()`, `deactivate()`).

## Performance Optimizations
- **N+1 Prevention:** `@EntityGraph(attributePaths = {"seller"})` used aggressively on Repositories.
- **Caching:** `@Cacheable` used on lookup repositories (brands, types, genres).
- **Query Optimization:** Single CTE queries for View Statistics (`getViewStatisticsWithDailyBreakdown`).
- **Pagination:** Mandatory `Pageable` on all list endpoints.

## Pitfalls
- Creating new categories without extending `AbstractListingService`.
- Bypassing the `ListingValidationEngine`.

## Related Files
- `src/main/java/com/serhat/secondhand/listing/application/category/AbstractListingService.java`
- `src/main/java/com/serhat/secondhand/listing/domain/entity/Listing.java`
