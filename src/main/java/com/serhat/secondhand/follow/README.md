# Follow Domain

## Purpose
The `follow` domain enables buyers to follow favorite sellers, customize new-listing notification preferences, and receive automatic activity feed alerts when sellers publish items.

## Architecture Overview
- **Follow Entity:** `SellerFollow` manages directional relationships between `follower` (buyer) and `followed` (seller), enforced by a composite unique constraint (`follower_id, followed_id`).
- **Soft Deletion:** Utilizes `@SQLDelete` and `@SQLRestriction("deleted_at IS NULL")` to preserve historical social graph metrics while allowing clean un-follow and re-follow cycles.
- **Event-Driven Feed Integration:** `NewListingNotificationListener` listens to listing publish events and dispatches asynchronous notification events to followers who have `notifyOnNewListing = true`.

## Business Invariants & Constraints
- **Self-Follow Prevention:** Users are prevented from following their own seller profile (`follower_id != followed_id`).
- **Atomic Toggle / Idempotency:** Submitting a follow request for an existing active relationship either updates notification flags or errors cleanly with `ALREADY_FOLLOWING`.
- **Soft Delete Re-activation:** If a previously unfollowed relationship is re-established, the existing record is restored with `deleted_at = null`.

## Integration Points
- **Incoming:** Listens to `ListingCreatedEvent` / `ListingPublishedEvent` from the `listing` domain.
- **Outgoing:** Dispatches `NotificationDispatchRequestedEvent` to the `notification` domain for active followers.

## Public APIs
- `POST /api/v1/follows/{sellerId}`: Follows a seller with configurable notification preferences.
- `DELETE /api/v1/follows/{sellerId}`: Unfollows a seller (soft delete).
- `GET /api/v1/follows/following`: Paginated list of sellers followed by the current user.
- `GET /api/v1/follows/followers/{sellerId}`: Follower count and public stats for a seller profile.
