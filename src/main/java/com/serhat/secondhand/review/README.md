# Review Domain

## Purpose
The `review` domain manages post-transaction user feedback, calculating aggregated statistics for sellers and individual listings.

## Architecture Overview
- **ReviewService:** Central orchestration for creating reviews and invalidating aggregate caches.
- **ReviewValidator:** Enforces delivery status and ownership prerequisites before creation.
- **Projections:** DB-level aggregations (`ReviewStatsProjection`) are mapped directly to DTOs for performance.

## Business Invariants & Constraints
- **Delivery Prerequisite:** A review can only be created if the associated order item is in the `DELIVERED` state.
- **Ownership:** A user can only review an item they explicitly purchased.
- **Idempotency:** A user can only leave one review per order item. Duplicate attempts throw an error.
- **Best-Effort Notifications:** Failing to send a review notification does not roll back the review creation transaction.

## State Machines
- **Review:** Created (Immutable).

## Integration Points
- **Incoming:** HTTP requests from the client.
- **Outgoing:** Queries `order` for delivery status. Notifies users asynchronously.

## Public APIs
- Create review, Get User Statistics, Get Listing Statistics, Get Batch Listing Statistics.

## Related Knowledge
- **Modify Review Behavior**
  -> `.docs/runbooks/modify-review-behavior.md`
