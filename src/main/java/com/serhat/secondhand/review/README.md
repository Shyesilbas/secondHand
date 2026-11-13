# Review Domain

Manages post-delivery buyer ratings (1-5 stars) and text feedback (`reviews` table, unique on `order_item_id`), SQL aggregate rating projections, and seller reputation badge re-evaluation (`SellerEligibilityRecheckEvent`).

> [!NOTE]
> **Related Documentation & Runbooks:**
> - **Architecture Deep Dive:** [`docs/social-proof-and-urgency-metrics-architecture.md`](/docs/social-proof-and-urgency-metrics-architecture.md)
> - **Frontend Module:** [`secondhand-frontend/src/reviews/README.md`](/secondhand-frontend/src/reviews/README.md)
> - **Key Entry Points:** [`ReviewController`](api/ReviewController.java) · [`ReviewService`](application/ReviewService.java) · [`IReviewService`](application/IReviewService.java) · [`ReviewValidator`](validator/ReviewValidator.java) · [`ReviewMapper`](mapper/ReviewMapper.java)

## Business Rules & Invariants
- **Verified Delivery & Buyer Ownership (`ReviewValidator`, `ReviewErrorCodes`):**
  - The target `OrderItem` must exist (`ORDER_ITEM_NOT_FOUND`) and belong to a fulfilled order (`ShippingStatus.DELIVERED` for cargo, or `OrderStatus.HANDOVER_CONFIRMED` / `OrderStatus.COMPLETED` for Safe Meetup; otherwise `ORDER_ITEM_NOT_DELIVERED`).
  - Only the order buyer (`order.buyer.id == reviewerId`) may submit the review (`NOT_ORDER_BUYER`).
  - `rating` must be between `1` and `5` inclusive (`INVALID_RATING`).
- **Single Review per Order Item:** Enforced by `UNIQUE (order_item_id)`; duplicate attempts return `REVIEW_ALREADY_EXISTS`.
- **Prestige & Notification Hooks:** Saving a review notifies the seller (`NotificationTemplateCatalog`), publishes `SellerEligibilityRecheckEvent` (consumed by `user` to re-evaluate the `isGreatSeller` badge), and uses SQL projections (`ReviewStatsProjection`, `ListingReviewStatsProjection`, `GreatSellerReviewMetrics`) for aggregate stats.
- **Change rule:** New stats fields: update `ReviewStatsProjection` / `ListingReviewStatsProjection` and the `ReviewRepository` aggregate queries together.

## Redis & Caching
- Review creation evicts Spring cache `user:stats:reviews` (`@CacheEvict(value = "user:stats:reviews", allEntries = true)`).

## API
- `POST /api/v1/reviews` (`ReviewController`) — create a review for a delivered order item (`ReviewDto`).
- `GET /api/v1/reviews?orderItemIds=` (`ReviewController`) — batch lookup reviews by order item IDs (max 100).
- Seller and listing review feeds are served at `/api/v1/users/{user-id}/reviews`, `/api/v1/users/{user-id}/review-stats` (`UserController`), and `/api/v1/listings/{listing-id}/reviews` (`ListingController`).
