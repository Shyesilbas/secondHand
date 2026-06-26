# Reviews UI Module

## Purpose
The `reviews` UI module provides components and hooks to display star ratings, aggregate statistics, and paginate user feedback.

## Architecture Overview
- **useReviews:** Utilizes `useInfiniteQuery` for "Load More" pagination of user review lists.
- **useListingReviews:** Fetches reviews for a specific listing, utilizing `gcTime` for aggressive caching.
- **InteractiveStarRating & RatingStarsDisplay:** Standardized components for collecting and displaying SVG star ratings without duplicating path code.

## Business Invariants & Constraints
- **No Path Duplication:** Star SVG paths are centralized in `StarIcon` to ensure visual consistency and reduce bundle size.
- **Gradient Collisions:** When rendering multiple review statistics cards, `ListingReviewStats` generates unique identifiers using `useId()` to prevent SVG gradient clipping issues.
- **Cache Pruning:** Cached statistics leverage TTL bounding to prevent unbounded memory growth (`useSellerReviewStatsCache`).

## Integration Points
- **Incoming:** Rendered inside listing details and user profile pages.
- **Outgoing:** Queries the backend `review` domain APIs.

## Related Knowledge
- **Modify Reviews UI**
  -> `.docs/runbooks/modify-reviews-ui.md`
