# Follow Domain

## 1. Executive Summary & Purpose
The `follow` domain implements user-to-seller social graph mechanics. It enables buyers to follow trustworthy sellers, customize notification preferences per seller, view seller subscriber counts, and automatically receive real-time push alerts and transactional emails whenever followed sellers publish new listings.

> [!NOTE]
> **Related Documentation & Runbooks:**
> - **Architecture Deep Dive:** [`docs/email-architecture-and-event-driven-dispatch.md`](../../../../../../../docs/email-architecture-and-event-driven-dispatch.md)
> - **Frontend Module:** [`secondhand-frontend/src/follow/README.md`](../../../../../../../secondhand-frontend/src/follow/README.md)

### Architectural Highlights
- **Directional Social Relationship:** `SellerFollow` entity represents a unidirectional relationship between `follower` (buyer) and `followed` (seller).
- **Soft Delete Reversible Lifecycle:** Uses `@SQLDelete` and Hibernate `@SQLRestriction("deleted_at IS NULL")` to preserve social graph history; re-following an unfollowed seller reactivates the archived record with `deleted_at = null`.
- **Event-Driven Feed Notification:** Listens to `NewListingCreatedEvent` via `NewListingNotificationListener` (`AFTER_COMMIT`, async), querying active subscribers with `notifyOnNewListing = true` to dispatch notifications without blocking the listing publishing flow.
- **IDOR & Self-Follow Prevention:** Strict checks prevent users from following their own profile (`CANNOT_FOLLOW_SELF`).

---

## 2. Architecture & Notification Event Flow

```mermaid
flowchart TD
    subgraph Client ["Client (Buyer)"]
        FollowReq["POST /api/v1/follows/{userId}"]
        UnfollowReq["DELETE /api/v1/follows/{userId}"]
        PrefReq["PATCH /api/v1/follows/{userId}/notifications\n(notifyOnNewListing: boolean)"]
    end

    subgraph ServiceLayer ["Follow Application Services"]
        SFS["SellerFollowService"]
        NLNL["NewListingNotificationListener\n(@TransactionalEventListener AFTER_COMMIT)"]
    end

    subgraph Storage ["PostgreSQL Social Graph"]
        FollowTable[("seller_follows\n(follower_id, followed_id, notify_on_new_listing, deleted_at)")]
    end

    subgraph EventDispatch ["Decoupled Dispatch Pipeline"]
        NEP["NotificationEventPublisher\n(in-app push & STOMP)"]
        EEP["EmailEventPublisher\n(mail.dispatch.v1 Kafka)"]
    end

    FollowReq --> SFS
    SFS -->|insert or reactivate| FollowTable
    UnfollowReq --> SFS
    SFS -->|soft delete (markDeleted)| FollowTable
    PrefReq --> SFS
    SFS -->|update notify flag| FollowTable

    ListingPublisher["listing module\n(NewListingCreatedEvent)"] --> NLNL
    NLNL --> SFS
    SFS -->|query active followers| FollowTable
    SFS -->|async dispatch| NEP & EEP
```

---

## 3. Core Entities & Database Schema

### `seller_follows` Table
- `id` (BIGINT, PK)
- `follower_id` (BIGINT, FK -> `users.id`, buyer)
- `followed_id` (BIGINT, FK -> `users.id`, seller)
- `notify_on_new_listing` (BOOLEAN, default `true`, indexed)
- `created_at` (TIMESTAMP, not null)
- `deleted_at` (TIMESTAMP, nullable for soft deletion)
- *Unique Constraint:* `UNIQUE (follower_id, followed_id)`
- *Indexes:* `idx_seller_follows_follower`, `idx_seller_follows_followed`

---

## 4. Business Invariants & Lifecycle Mechanics

### 4.1 Follow & Reactivation Lifecycle
1. **Self-Follow Check:** If `currentUser.getId().equals(userIdToFollow)`, rejects with `CANNOT_FOLLOW_SELF`.
2. **Active State Check:** If an active follow record exists, rejects with `ALREADY_FOLLOWING`.
3. **Archived Record Reactivation:** If an archived record with `deleted_at IS NOT NULL` exists, reactivates it by setting `deleted_at = null` and resets `notifyOnNewListing = true`.
4. **New Relationship Creation:** Otherwise, persists a new `SellerFollow` entity.

### 4.2 Unfollow (Soft Deletion)
- Unfollowing does not execute a hard SQL delete.
- Sets `deleted_at = LocalDateTime.now()` via `sellerFollowRepository.markDeleted(id, now)`.
- Preserves historical follower metrics for analytical auditing.

### 4.3 Automated New Listing Broadcast
1. When a seller publishes an item, the `listing` domain emits `NewListingCreatedEvent`.
2. `NewListingNotificationListener` catches the event after transaction commit (`TransactionPhase.AFTER_COMMIT`).
3. Calls `SellerFollowService.notifyFollowersOfNewListing(listing)` on thread pool `"notificationExecutor"`.
4. Queries all followers with `notifyOnNewListing = true` via `findByFollowedAndNotifyOnNewListingTrue`.
5. For each follower:
   - Emits in-app notification via `NotificationEventPublisher`.
   - Emits `NewListingEmailEvent` via `EmailEventPublisher` to the Kafka email pipeline.

---

## 5. Public REST API Specifications

| Method | Endpoint | Auth | Purpose | Response |
|---|---|---|---|---|
| `POST` | `/api/v1/follows/{user-id}` | Bearer | Follow a seller profile | `SellerFollowDto` |
| `DELETE` | `/api/v1/follows/{user-id}` | Bearer | Unfollow a seller (soft delete) | `200 OK` |
| `PATCH` | `/api/v1/follows/{user-id}/notifications` | Bearer | Toggle new listing notifications | `SellerFollowDto` |
| `GET` | `/api/v1/follows/following` | Bearer | Paginated sellers followed by current user | `Page<SellerFollowDto>` |
| `GET` | `/api/v1/follows/followers` | Bearer | Paginated followers of authenticated user | `Page<SellerFollowDto>` |
| `GET` | `/api/v1/follows/stats/{user-id}` | Public/Auth | Follower count, following count, isFollowing status | `FollowStatsDto` |
| `GET` | `/api/v1/follows/check/{user-id}` | Bearer | Boolean check if user is following target seller | `Boolean` |
| `GET` | `/api/v1/follows/user/{user-id}/followers` | Public | Paginated public followers of specified user | `Page<SellerFollowDto>` |
| `GET` | `/api/v1/follows/user/{user-id}/following` | Public | Paginated public following of specified user | `Page<SellerFollowDto>` |

---

## 6. Error Codes

Defined in `FollowErrorCodes`:
- `USER_NOT_FOUND`: Target seller does not exist.
- `CANNOT_FOLLOW_SELF`: Users cannot follow their own profile.
- `ALREADY_FOLLOWING`: Active follow relationship already exists.
- `NOT_FOLLOWING`: Follow relationship does not exist to unfollow.
