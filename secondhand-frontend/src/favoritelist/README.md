# Favorite List UI Module

Custom user-curated listing folders, public collection sharing, multi-list bookmarking, and social list appreciation.

> [!NOTE]
> **Backend Counterpart & Architecture Deep Dive:**
> - **Backend Module:** [`favoritelist`](../../../src/main/java/com/serhat/secondhand/favoritelist/README.md)
> - **Architecture Deep Dive:** [`docs/social-proof-and-urgency-metrics-architecture.md`](../../../docs/social-proof-and-urgency-metrics-architecture.md)

## 1. Overview & Purpose

The `favoritelist` module expands beyond simple one-click favoriting by enabling users to create and organize customized listing collections (e.g., "Vintage Road Bikes", "Living Room Furniture", "Summer Outfits"). The module provides:
1. **Curated Collections:** Creating, editing, and deleting named folders with custom descriptions and visibility settings (`FavoriteListModal`).
2. **Multi-List Bookmarking:** Multi-selection modal (`AddToListModal`) that allows adding or removing a single listing across multiple user lists simultaneously.
3. **Dedicated Collection View:** Full detail page (`FavoriteListDetailPage`) displaying saved items, notes, listing statuses (Active vs Sold), and public share links.
4. **Social Sharing & Curation:** Public collections can be shared via direct link and liked by other marketplace members.

## 2. Route Map & Entry Points

| Path | Page | Access |
|---|---|---|
| `/lists/:listId` | `FavoriteListDetailPage` | Public |

| Embedded entry | Where |
|---|---|
| `FavoriteListModal` | Create or update dialog for list title, description, and privacy toggle (`isPublic`). |
| `AddToListModal` | Triggered via `AddToListButton` on listing cards to manage list memberships. |

## 3. Component Rules

- **Multi-Membership Invariant:** A listing can belong to multiple favorite lists at the same time. The `AddToListModal` checks existing associations using `useListsContainingListing`.
- **Privacy Enforcement:** Private lists are only accessible by the list owner; unauthorized access attempts on `FavoriteListDetailPage` render the not found error state.
- **Copy Link Feedback:** Public list sharing copies the canonical URL to the system clipboard and triggers a success notification.

---

## 4. React Query Keys

Generated from code; the hook files are the source of truth.

| Query key | Defined in |
|---|---|
| `['favoriteLists', 'containing', listingId]` | `useFavoriteLists.js` |
| `['favoriteLists', 'my', user?.id, page, size]` | `useFavoriteLists.js` |
| `['favoriteLists', 'user', userId, isOwnProfile, page, size]` | `useFavoriteLists.js` |
| `['favoriteLists', listId]` | `useFavoriteLists.js` |

| Invalidated / updated key | By |
|---|---|
| `['favoriteLists', 'containing', listingId]` | `useFavoriteLists.js` |
| `['favoriteLists', 'my', user?.id]` | `useFavoriteLists.js` |
| `['favoriteLists', 'popular']` | `useFavoriteLists.js` |
| `['favoriteLists', 'user', user?.id, true]` | `useFavoriteLists.js` |
| `['favoriteLists', listId]` | `useFavoriteLists.js` |

## 5. Form & Data Validation Rules

Constraints enforced by `FAVORITE_LIST_MODAL_LIMITS`:
- **List Name:** Mandatory non-empty string, maximum 100 characters (`NAME_MAX`). Trimmed on submission.
- **Description:** Optional string, maximum 500 characters (`DESCRIPTION_MAX`).
- **Item Note:** Optional custom note when adding an item to a list (e.g., "Compare price with Seller B").
