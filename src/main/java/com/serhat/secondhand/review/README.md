# Review Domain

## Purpose
The `review` domain manages post-transaction user feedback, rating validation, and review querying for completed marketplace purchases.

## Architecture Overview
- **ReviewService:** Central orchestration for creating reviews and resolving review data by order items.
- **ReviewValidator:** Enforces delivery status (`DELIVERED`), rating bounds (1-5), and buyer ownership prerequisites before creation.
- **Projections:** Database-level aggregations (`ReviewStatsProjection`) power seller and listing rating calculations across other domains.

## Business Invariants & Constraints
- **Delivery Prerequisite:** A review can only be created if the associated order item is in the `DELIVERED` state.
- **Ownership:** A user can only review an item from an order they explicitly placed.
- **Idempotency:** A user can only leave one review per order item. Duplicate attempts are rejected with `ALREADY_REVIEWED`.
- **Best-Effort Notifications:** Failing to send a review notification does not roll back the review creation transaction.

## State Machines
- **Review:** Created (Immutable).

## Integration Points
- **Incoming:** HTTP requests via `ReviewController`.
- **Outgoing:** Queries `order` for delivery confirmation. Evaluated by `user` domain for Great Seller prestige eligibility.

## Public APIs
- `POST /api/v1/reviews`: Creates a new rating and review for a delivered order item.
- `GET /api/v1/reviews?orderItemIds={id1,id2}`: Fetches reviews matching a comma-separated list of order item IDs (max 100).

*(Note: Aggregated seller review statistics are served via `UserController` under `/api/v1/users/{user-id}/reviews/*` and `/review-stats`; listing review statistics are served via `ListingController` under `/api/v1/listings/{listing-id}/reviews/*`)*.

## Related Knowledge
- **Modify Review Behavior**
  -> `.docs/runbooks/modify-review-behavior.md`
