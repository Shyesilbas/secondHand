# Reviews UI Module

Star ratings, aggregate statistics and paginated review lists. Rendered in listing details and user profiles; calls the backend `review` APIs.

## Architecture
- `useReviews`: `useInfiniteQuery` "Load More" list (needs `hasMore`, `loadMore`, and `onRetry` bound to `refetch` in `ReviewsList`).
- `useUserReviewStats`: cached rating stats for a user (seller cards in cart and checkout use it too).

## Invariants
- Star paths live only in `StarIcon`; use `InteractiveStarRating` / `RatingStarsDisplay` (check the `ceil` vs `round` mode).
- `ReviewButton` never fetches; the order detail passes `existingReview` from `useOrderItemReviews` and refetches it after a review is created.
- Changing pagination query keys requires updating the invalidation logic.
