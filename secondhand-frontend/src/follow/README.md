# Follow UI Module

Seller following system, follower/following relationship lists, and new-listing notification preferences.

> [!NOTE]
> **Backend Counterpart & Architecture Deep Dive:**
> - **Backend Module:** [`follow`](../../../src/main/java/com/serhat/secondhand/follow/README.md)
> - **Architecture Deep Dive:** [`docs/email-architecture-and-event-driven-dispatch.md`](../../../docs/email-architecture-and-event-driven-dispatch.md)

## 1. Overview & Purpose

The `follow` module establishes social trust and subscription channels between buyers and sellers. When a buyer follows a reputable seller:
1. **Seller Follow Actions:** `FollowButton` placed on seller profile headers and listing detail pages allows one-click follow/unfollow.
2. **Notification Alerts:** Users can toggle notification preferences (`notifyOnNewListing`) to receive instant in-app alerts whenever a followed seller publishes a new listing.
3. **Social Graphs:** `FollowStats` displays real-time counts of followers and following connections.
4. **Follow Relationship Browser:** `FollowListModal` displays paginated lists of accounts following or followed by a targeted user, allowing direct navigation and reciprocal follow actions.

## 2. Route Map & Entry Points

- No own route; components are embedded in other modules' pages.

| Embedded entry | Where |
|---|---|
| `FollowListModal` | Opened via click on follower/following counters in `FollowStats`. Displays tabbed follower and following user cards. |
| `FollowButton` | Embedded in seller profile banners and listing detail cards. Prompts login if clicked while unauthenticated. |
| `FollowStats` | Embedded in user profile headers to display follower metrics. |

## 3. Component Rules

- **Self-Follow Prevention:** Users cannot follow their own profile. When `userId === currentUserId`, `FollowButton` is automatically hidden.
- **Listing Notification Toggle:** Followed sellers feature a notification bell action in `FollowButton` that toggles `notifyOnNewListing` preference via `PATCH /v1/follows/{userId}/notifications`.
- **Guest Protection:** Unauthenticated clicks on `FollowButton` prompt the sign-in modal rather than failing network calls.

---

## 4. React Query Keys

Generated from code; the hook files are the source of truth.

| Query key | Defined in |
|---|---|
| `['followStats', normalizedUserId]` | `useFollow.js` |
| `['followers-list', userId]` | `FollowListModal.jsx` |
| `['following-list', userId]` | `FollowListModal.jsx` |

| Invalidated / updated key | By |
|---|---|
| `['followStats', normalizedUserId]` | `useFollow.js` |

## 5. Form & Data Validation Rules

- **User Identifier:** `userId` must be a valid non-empty string.
- **Pagination Validation:** `getUserFollowers` and `getUserFollowing` default to `page = 0` and `size = 20`.
- **State Invariants:** Notification toggle is disabled when `isFollowing === false`.
