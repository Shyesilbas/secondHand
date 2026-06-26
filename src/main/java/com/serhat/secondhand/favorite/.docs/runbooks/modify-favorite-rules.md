# Modify Favorite Rules

## Purpose
Execution instructions for modifying how listings are favorited, toggled, or how favorite statistics are calculated.

## When to Load
- When altering rules for adding/removing favorites.
- When updating cache invalidation keys for favorite stats.
- When optimizing the performance of favorite batch queries.

## When NOT to Load
- When modifying `FavoriteList` (collections) logic.

## Assumptions
- A user cannot favorite their own listing.
- A user cannot favorite an inactive listing.
- Statistics endpoints utilize DB batch counts.

## Procedure
1. Add any new error codes directly to `FavoriteErrorCodes`. Do not use hardcoded strings.
2. Apply listing-level guard rules (active state, ownership) in `ListingAccessService`.
3. Apply favorite-specific behavior (e.g. toggle logic) in `FavoriteService`.
4. Ensure that any write operation (`addToFavorites`, `removeFromFavorites`, `toggleFavorite`) retains the `@Transactional` and `@CacheEvict(allEntries = true)` semantics to keep stats accurate.

## Pitfalls
- Modifying a write operation but forgetting to evict the `favoriteStatsBatch` cache.
- Using N+1 querying in top-favorited endpoints instead of using batch/aggregate projections.

## Related Files
- `src/main/java/com/serhat/secondhand/favorite/application/FavoriteService.java`
- `src/main/java/com/serhat/secondhand/favorite/application/ListingAccessService.java`
