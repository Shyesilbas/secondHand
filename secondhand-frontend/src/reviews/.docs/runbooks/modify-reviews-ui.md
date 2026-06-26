# Modify Reviews UI

## Purpose
Execution steps for altering the review list pagination, star rating visualization, or review submission flow.

## When to Load
- When fixing issues with infinite scrolling ("Load More").
- When updating the appearance of the rating stars.
- When modifying the review submission modal.

## When NOT to Load
- When changing backend review statistics aggregations.

## Assumptions
- Star rendering is centralized to avoid duplicate SVG paths.
- Infinite scrolling relies on React Query's `getNextPageParam` logic.

## Procedure
1. **Load More Fails:** Ensure `useReviews` correctly exposes `hasMore` and `loadMore`, and that the `ReviewsList` component correctly binds the `onRetry` callback to `refetch`.
2. **Stale Cache:** Check `gcTime` and `staleTime` inside `useListingReviews`. If a listing is updated, ensure the upstream invalidation targets the correct query key.
3. **Broken Stars:** Ensure `useId()` is used inside `ListingReviewStats` to prevent SVG gradient `id` collisions when rendering multiple cards. Verify the `mode` (`ceil` vs `round`) in `RatingStarsDisplay`.

## Pitfalls
- Copy-pasting SVG paths for stars instead of using `StarIcon`.
- Changing pagination query keys without updating invalidation logic.

## Related Files
- `src/reviews/hooks/useReviews.js`
- `src/reviews/components/ListingReviewStats.jsx`
