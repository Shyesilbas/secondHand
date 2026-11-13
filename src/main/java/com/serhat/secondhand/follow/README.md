# Follow Domain

Manages unidirectional buyer-to-seller follow relationships (`seller_follows` table, unique on `(follower_id, followed_id)`), soft-delete reactivation, per-seller notification preferences, and asynchronous new-listing alerts (`NewListingNotificationListener`).

> [!NOTE]
> **Related Documentation & Runbooks:**
> - **Architecture Deep Dive:** [`docs/email-architecture-and-event-driven-dispatch.md`](/docs/email-architecture-and-event-driven-dispatch.md)
> - **Frontend Module:** [`secondhand-frontend/src/follow/README.md`](/secondhand-frontend/src/follow/README.md)
> - **Key Entry Points:** [`SellerFollowController`](api/SellerFollowController.java) · [`SellerFollowService`](application/SellerFollowService.java) · [`NewListingNotificationListener`](application/NewListingNotificationListener.java) · [`SellerFollowMapper`](mapper/SellerFollowMapper.java)

## Business Rules & Invariants
- **No Self-Follow (`FollowErrorCodes`):** Users cannot follow their own profile (`CANNOT_FOLLOW_SELF`), and duplicate active follows return `ALREADY_FOLLOWING`.
- **Soft-Delete & Reactivation Lifecycle:** Unfollowing sets `deleted_at = now()` (`markDeleted`, filtered via `@SQLRestriction("deleted_at IS NULL")`). Re-following an unfollowed seller clears `deleted_at = null` and resets `notifyOnNewListing = true` on the existing row rather than inserting a duplicate.
- **After-Commit New Listing Broadcast (`NewListingNotificationListener`):** Listens to `NewListingCreatedEvent` (`TransactionPhase.AFTER_COMMIT`, async `"notificationExecutor"`), queries active followers with `notifyOnNewListing = true`, and dispatches both in-app notifications (`NotificationEventPublisher`) and `NewListingEmailEvent` (`EmailEventPublisher` -> `mail.dispatch.v1`).

## API (`SellerFollowController`, `/api/v1/follows`)
- `POST /{user-id}` & `DELETE /{user-id}` — follow or soft-unfollow a seller.
- `PATCH /{user-id}/notifications` — toggle `notifyOnNewListing` for a followed seller.
- `GET /following` & `GET /followers` — paginated follows/followers for the authenticated user.
- `GET /user/{user-id}/followers` & `GET /user/{user-id}/following` — public paginated followers/following for `user-id`.
- `GET /stats/{user-id}` & `GET /check/{user-id}` — `FollowStatsDto` (counts + `isFollowing`) and boolean check.
