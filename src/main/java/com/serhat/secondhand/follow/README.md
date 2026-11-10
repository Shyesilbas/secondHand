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
- **Incoming:** `NewListingNotificationListener` handles `NewListingCreatedEvent` from the `listing` domain (`AFTER_COMMIT`, async). HTTP requests via `SellerFollowController`.
- **Outgoing:** Dispatches `NotificationDispatchRequestedEvent` to the `notification` domain for active followers.

## Public APIs
- `POST /api/v1/follows/{user-id}`: Follows a seller.
- `DELETE /api/v1/follows/{user-id}`: Unfollows a seller (soft delete).
- `PATCH /api/v1/follows/{user-id}/notifications`: Toggles notification preference for followed seller.
- `GET /api/v1/follows/following`: Paginated list of sellers followed by the current user.
- `GET /api/v1/follows/followers`: Paginated list of followers of the authenticated user.
- `GET /api/v1/follows/stats/{user-id}`: Follower and following count statistics for a profile.
- `GET /api/v1/follows/check/{user-id}`: Checks if current user is following the target seller.
- `GET /api/v1/follows/user/{user-id}/followers`: Paginated public followers of a user.
- `GET /api/v1/follows/user/{user-id}/following`: Paginated public followings of a user.
