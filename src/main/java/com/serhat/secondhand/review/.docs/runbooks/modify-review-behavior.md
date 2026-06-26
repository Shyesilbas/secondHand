# Modify Review Behavior

## Purpose
Execution steps for adding new review fields, changing validation logic, or updating review statistical calculations.

## When to Load
- When modifying how a review is created.
- When changing review statistics aggregation logic.
- When altering cache invalidation logic for reviews.

## When NOT to Load
- When fixing issues related to order delivery status updates.
- When modifying listing display pages.

## Assumptions
- Only users who purchased an item (via an `orderItem`) that has been `DELIVERED` can leave a review.
- Duplicate reviews for the same `orderItem` are caught via unique constraint handling.

## Procedure
1. If adding statistical fields, modify the `ReviewStatsProjection` and `ListingReviewStatsProjection` interfaces first.
2. Update `ReviewRepository` aggregate queries to match the projection changes.
3. If changing creation rules, apply validations in `ReviewValidator`. Do not skip ownership or delivered status checks.
4. For caching: the batch cache key is a sorted list of IDs. Ensure `ReviewService.createReview` correctly evicts the cache for the specific listing.

## Pitfalls
- Breaking `EntityGraph` hints during DTO mapping, resulting in N+1 lazy loading issues.
- Relying entirely on application-level checks for duplicates instead of preserving DB unique constraints.

## Related Files
- `src/main/java/com/serhat/secondhand/review/application/ReviewService.java`
- `src/main/java/com/serhat/secondhand/review/repository/ReviewRepository.java`
