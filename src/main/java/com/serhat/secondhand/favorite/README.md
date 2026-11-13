# Favorite Domain

Manages user listing bookmarks (`favorites` table, unique on `(user_id, listing_id)`), single and batch favorite statistics (`FavoriteStatsService`), top-favorited feeds, and seller private offer broadcasts to favoriters (`broadcastOfferToFavoriters`).

> [!NOTE]
> **Related Documentation & Runbooks:**
> - **Architecture Deep Dive:** [`docs/social-proof-and-urgency-metrics-architecture.md`](/docs/social-proof-and-urgency-metrics-architecture.md) (batch social proof projections & urgency metrics)
> - **Frontend Module:** [`secondhand-frontend/src/favorites/README.md`](/secondhand-frontend/src/favorites/README.md)
> - **Key Entry Points:** [`FavoriteController`](api/FavoriteController.java) · [`FavoriteService`](application/FavoriteService.java) · [`FavoriteStatsService`](application/FavoriteStatsService.java) · [`ListingAccessService`](application/ListingAccessService.java) · [`FavoriteMapper`](domain/mapper/FavoriteMapper.java)

## Business Rules & Invariants
- **Active State & Self-Favorite Prevention:** Bookmarking requires `ListingStatus.ACTIVE` (`ListingAccessService.validateActive`, `FavoriteErrorCodes.LISTING_NOT_ACTIVE`). Users cannot favorite their own listings (`OWN_LISTING`).
- **Idempotency & Concurrency:** Enforced by `UNIQUE (user_id, listing_id)`; concurrent duplicate inserts catch `DataIntegrityViolationException` and resolve cleanly (`ALREADY_FAVORITED`).
- **Fail-Safe Seller Notification:** Favoriting dispatches a `LISTING_FAVORITED` alert to the seller via `NotificationEventPublisher`; notification failures are caught and logged so bookmark persistence never rolls back.
- **Seller Broadcast Offers (`broadcastOfferToFavoriters`):** Verified listing owners can broadcast a discounted in-chat offer to all active favoriters (`findUsersByListingId`), returning `FavoriterBroadcastResponseDto`.
- **Change rule:** Write methods keep `@Transactional` + `@CacheEvict(allEntries = true)` on `user:stats:favorites`.

## Redis & Caching
- Mutations evict Spring cache `user:stats:favorites` (`@CacheEvict(value = "user:stats:favorites", allEntries = true)`).

## API (`FavoriteController`, `/api/v1/favorites`)
- `POST /` · `DELETE /{listing-id}` · `POST /toggle` — add, remove, or toggle a favorite.
- `GET /` & `GET /ids` — paginated favorites (`Page<FavoriteDto>`) or all favorited UUIDs for the authenticated user.
- `GET /stats/{listing-id}` & `POST /stats` — single or batch `FavoriteStatsDto` lookups (prevents N+1 on listing cards).
- `GET /check/{listing-id}` & `GET /count/{listing-id}` — boolean check and total favorite count.
- `GET /top` & `GET /top-listings` — top favorited listings across the platform.
- `POST /listings/{listing-id}/broadcast-offer` — seller broadcasts a discounted offer to favoriters.
