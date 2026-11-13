# Favorites UI Module

Saved listings management, heart toggle buttons, optimistic favorite state updates, and seller private offer targeting.

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

## 2. Route Map & Entry Points

| Path | Page | Access |
|---|---|---|
| `/favorites` | `FavoritesPage` | Protected |

| Embedded entry | Where |
|---|---|
| `FavoriteButton` | Mounted inside `ListingCard`, listing detail headers, and comparison tables. Prompts guest sign-in modal if clicked while unauthenticated. |

## 3. Component Rules

- **`FavoriteButton` Auth Guard:** When an unauthenticated visitor clicks the heart icon, the mutation is blocked and the login prompt modal is displayed.
- **Optimistic Mutation:** State transitions update locally immediately. If the server request fails, the heart toggles back and a non-intrusive error notification is surfaced.
- **Count Synchronization:** Toggling favorites updates both the item-level active state and the total favorite count rendered on product cards.

---

## 4. React Query Keys

Generated from code; the hook files are the source of truth.

| Query key | Defined in |
|---|---|
| `['favorites', user?.id, currentPage, size]` | `useFavorites.js` |

| Invalidated / updated key | By |
|---|---|
| `['favorites', user?.id]` | `useFavorites.js` |
| `['favorites']` | `FavoriteButton.jsx` |
| `['listing', listingId]` | `FavoriteButton.jsx` |
| `['listings']` | `FavoriteButton.jsx` |

## 5. Form & Data Validation Rules

- **Input Payload:** `createFavoriteRequest(listingId)` ensures `listingId` is formatted properly as a valid UUID or numerical string.
- **Pagination Validation:** `page` is zero-indexed and clamped to non-negative integers; `size` defaults to `FAVORITE_DEFAULTS.PAGE_SIZE = 12`.
- **Duplicate Prevention:** Toggling is idempotent on the backend; multiple rapid clicks are debounced by the mutation state.
