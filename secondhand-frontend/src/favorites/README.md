# Favorites UI Module

Saved listings management, heart toggle buttons, optimistic favorite state updates, and seller private offer targeting.

---

> [!NOTE]
> **Backend Counterpart & Architecture Deep Dive:**
> - **Backend Module:** [`favorite`](../../../src/main/java/com/serhat/secondhand/favorite/README.md)
> - **Architecture Deep Dive:** [`docs/social-proof-and-urgency-metrics-architecture.md`](../../../docs/social-proof-and-urgency-metrics-architecture.md)

## 1. Overview & Purpose

The `favorites` module provides users with the ability to bookmark listings they are interested in monitoring or purchasing later. In addition to serving as a personal wishlist:
1. **Wishlist Management:** Full-page grid (`FavoritesPage`) displaying active and inactive saved listings with quick removal actions and pagination.
2. **Contextual Heart Action:** Reusable `FavoriteButton` mounted on listing grid cards, search result tiles, and listing detail hero headers.
3. **Seller Offer Targeting Pipeline:** Favoriting an item registers the buyer in the seller's prospective buyer pool, allowing sellers to broadcast targeted private discount offers to interested buyers via the offer module.
4. **Optimistic Responsiveness:** Heart state transitions toggle immediately on click and rollback smoothly upon network error.

---

## 2. Route Map & Entry Points

| Route | Guard / Access | Component | Purpose & Query Params |
|---|---|---|---|
| `/favorites` | `ProtectedRoute` | `FavoritesPage` | Main saved listings grid; requires user authentication. Supports `page` pagination. |
| Embedded Element | Public / Auth Prompt | `FavoriteButton` | Mounted inside `ListingCard`, listing detail headers, and comparison tables. Prompts guest sign-in modal if clicked while unauthenticated. |

---

## 3. Component Hierarchy & Core Sub-Components

```
favorites/
├── pages/
│   └── FavoritesPage.jsx              # Main protected route displaying saved listing cards
├── components/
│   └── FavoriteButton.jsx             # Heart toggle button with optimistic animation and tooltip
├── hooks/
│   └── useFavorites.js                # React Query hook for favorite lists and toggle mutations
├── services/
│   └── favoriteService.js             # REST API client for /v1/favorites endpoints
├── favoriteConstants.js               # Pagination limits, cache durations, and notification copy
├── favorites.js                       # Request payload factory (createFavoriteRequest)
└── index.js                           # Module entry point exporting components, hooks, and services
```

### Component Roles & Invariants
- **`FavoriteButton` Auth Guard:** When an unauthenticated visitor clicks the heart icon, the mutation is blocked and the login prompt modal is displayed.
- **Optimistic Mutation:** State transitions update locally immediately. If the server request fails, the heart toggles back and a non-intrusive error notification is surfaced.
- **Count Synchronization:** Toggling favorites updates both the item-level active state and the total favorite count rendered on product cards.

---

## 4. State Management & React Query Contract

### Query Keys & Cache Matrix
| Query Key | Scope | Stale Time | Garbage Collection | Invalidation Triggers |
|---|---|---|---|---|
| `['favorites', userId, page, size]` | User saved listings list | 1 min (`60000ms`) | 5 min (`300000ms`) | Toggle favorite mutation on any listing |
| `['favorites', userId]` | Broad user favorite prefix | 1 min (`60000ms`) | 5 min (`300000ms`) | `toggleFavoriteMutation.onSuccess` invalidation |
| `['favoriteStats', listingId]` | Listing favorite count / flag | 30 sec (`30000ms`) | 5 min (`300000ms`) | Toggle favorite mutation on listing detail |

### Hooks Contract
- `useFavorites(page, size, options)`: Returns `{ favorites, pagination, isLoading, error, fetchFavorites, loadPage, toggleFavorite }`.
- `toggleFavorite(listing)`: Dispatches `POST /v1/favorites/toggle` and invalidates all user favorite queries.

---

## 5. Form & Data Validation Rules

- **Input Payload:** `createFavoriteRequest(listingId)` ensures `listingId` is formatted properly as a valid UUID or numerical string.
- **Pagination Validation:** `page` is zero-indexed and clamped to non-negative integers; `size` defaults to `FAVORITE_DEFAULTS.PAGE_SIZE = 12`.
- **Duplicate Prevention:** Toggling is idempotent on the backend; multiple rapid clicks are debounced by the mutation state.

---

## 6. UX States, Backend Error Contract & Restrained Design Tokens

### 4-State UX Handling
1. **Loading State:** `FavoritesPage` renders a responsive 3-column skeleton grid matching the listing card geometry.
2. **Empty State:** Clean empty state container with an outlined heart icon, informative copy (`"No favorites yet"`), and a primary action button redirecting to `/listings`.
3. **Error State:** Error banner indicating connection failure with an inline retry button.
4. **Data State:** Interactive grid of listing cards with price badges, seller avatars, stock indicators, and removal buttons.

### Backend Error Contract
- **`ProblemDetail` / Result Responses:** Evaluated via notification handlers.
- **Error Codes:**
  - `LISTING_NOT_FOUND`: If a favorited listing was deleted by the seller, the card displays a deactivated badge or is purged on refresh.
  - `UNAUTHORIZED`: Triggers automatic token refresh or redirects to login.

### Restrained Design Tokens
- **Heart Toggle Palette:** Inactive hearts use muted outline (`text-muted-foreground stroke-current fill-transparent hover:text-foreground`). Active hearts use restrained crimson/rose (`text-rose-500 fill-rose-500`). No bouncing party animations or explosive particles.
- **Grid Layout:** Responsive CSS grid (`grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4`).
- **Corner Radii:** Strict adherence to `rounded-md` on cards and buttons.
