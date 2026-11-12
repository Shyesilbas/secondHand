# Follow UI Module

Seller following system, follower/following relationship lists, and new-listing notification preferences.

---

## 1. Overview & Purpose

The `follow` module establishes social trust and subscription channels between buyers and sellers. When a buyer follows a reputable seller:
1. **Seller Follow Actions:** `FollowButton` placed on seller profile headers and listing detail pages allows one-click follow/unfollow.
2. **Notification Alerts:** Users can toggle notification preferences (`notifyOnNewListing`) to receive instant in-app alerts whenever a followed seller publishes a new listing.
3. **Social Graphs:** `FollowStats` displays real-time counts of followers and following connections.
4. **Follow Relationship Browser:** `FollowListModal` displays paginated lists of accounts following or followed by a targeted user, allowing direct navigation and reciprocal follow actions.

---

## 2. Route Map & Entry Points

| Route | Guard / Access | Component | Purpose & Query Params |
|---|---|---|---|
| In-Modal / Embedded | Public / Protected | `FollowListModal` | Opened via click on follower/following counters in `FollowStats`. Displays tabbed follower and following user cards. |
| Embedded Element | Public / Auth Prompt | `FollowButton` | Embedded in seller profile banners and listing detail cards. Prompts login if clicked while unauthenticated. |
| Embedded Element | Public | `FollowStats` | Embedded in user profile headers to display follower metrics. |

---

## 3. Component Hierarchy & Core Sub-Components

```
follow/
├── components/
│   ├── FollowButton.jsx               # Action button for follow/unfollow with notification bell
│   ├── FollowStats.jsx                # Counters for followers and following members
│   └── FollowListModal.jsx            # Modal displaying user lists with follow-back toggles
├── hooks/
│   └── useFollow.js                   # React Query hooks for follow operations and stats
├── services/
│   └── followService.js               # REST client for /v1/follows endpoints
└── index.js                           # Module entry point
```

### Component Roles & Invariants
- **Self-Follow Prevention:** Users cannot follow their own profile. When `userId === currentUserId`, `FollowButton` is automatically hidden.
- **Listing Notification Toggle:** Followed sellers feature a notification bell action in `FollowButton` that toggles `notifyOnNewListing` preference via `PATCH /v1/follows/{userId}/notifications`.
- **Guest Protection:** Unauthenticated clicks on `FollowButton` prompt the sign-in modal rather than failing network calls.

---

## 4. State Management & React Query Contract

### Query Keys & Cache Matrix
| Query Key | Scope | Stale Time | Garbage Collection | Invalidation Triggers |
|---|---|---|---|---|
| `['followStats', userId]` | Seller follower/following counts and flags | 30 sec (`30000ms`) | 5 min (`300000ms`) | Follow, unfollow, or notification toggle mutations |
| `['follow', 'followers', userId, page]` | Paginated followers list in modal | 1 min (`60000ms`) | 5 min (`300000ms`) | Follow / unfollow mutations |
| `['follow', 'following', userId, page]` | Paginated following list in modal | 1 min (`60000ms`) | 5 min (`300000ms`) | Follow / unfollow mutations |

### Hooks Contract
- `useFollowStats(userId, options)`: Returns `{ stats: { followersCount, followingCount, isFollowing, notifyOnNewListing }, isLoading, error, refetch }`.
- `useFollow(userId)`: Returns `{ follow, unfollow, toggleFollow, toggleNotifications, isFollowing, notifyOnNewListing, isLoading }`.

---

## 5. Form & Data Validation Rules

- **User Identifier:** `userId` must be a valid non-empty string.
- **Pagination Validation:** `getUserFollowers` and `getUserFollowing` default to `page = 0` and `size = 20`.
- **State Invariants:** Notification toggle is disabled when `isFollowing === false`.

---

## 6. UX States, Backend Error Contract & Restrained Design Tokens

### 4-State UX Handling
1. **Loading State:** `FollowButton` displays a subtle inline spinner when mutation is pending, maintaining fixed button dimensions to prevent layout shifts.
2. **Empty State:** In `FollowListModal`, empty tab states display clean neutral copy (`"No followers yet"` or `"Not following anyone yet"`).
3. **Error State:** Surface toast error message if follow or unfollow request fails.
4. **Data State:** Active state displays `"Following"` with checkmark; hover state shifts to subtle outline `"Unfollow"`.

### Backend Error Contract
- Handled through `useNotification` toast dispatches.
- Error codes:
  - `CANNOT_FOLLOW_SELF`: Thrown if attempting to follow own account.
  - `USER_NOT_FOUND`: Target user account was deleted or banned.

### Restrained Design Tokens
- **Follow Button Palette:** Unfollowed state uses primary solid button (`bg-primary text-primary-foreground`); followed state uses muted secondary outline (`bg-transparent border-border text-foreground hover:border-destructive hover:text-destructive`).
- **Corner Radii:** Strict `rounded-md` on buttons and avatar containers.
- **Icons:** Standard bell and user icons without excessive bounce animations.
