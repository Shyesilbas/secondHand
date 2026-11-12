# Favorite List UI Module

Custom user-curated listing folders, public collection sharing, multi-list bookmarking, and social list appreciation.

---

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

---

## 2. Route Map & Entry Points

| Route | Guard / Access | Component | Purpose & Query Params |
|---|---|---|---|
| `/favorites/lists/:id` | Public / Protected (for private lists) | `FavoriteListDetailPage` | View full contents of a curated list by ID. Displays creator header, like counter, and share action. |
| In-Modal / Embedded | `ProtectedRoute` | `FavoriteListModal` | Create or update dialog for list title, description, and privacy toggle (`isPublic`). |
| In-Modal / Embedded | `ProtectedRoute` | `AddToListModal` | Triggered via `AddToListButton` on listing cards to manage list memberships. |

---

## 3. Component Hierarchy & Core Sub-Components

```
favoritelist/
├── pages/
│   └── FavoriteListDetailPage.jsx    # Full collection view with listing cards and notes
├── components/
│   ├── FavoriteListCard.jsx           # Folder card with cover thumbnail preview and count
│   ├── FavoriteListModal.jsx          # Creation/editing dialog for list metadata
│   ├── AddToListModal.jsx             # Multi-checkbox dialog for assigning a listing to lists
│   └── AddToListButton.jsx            # Reusable trigger button mounted on listing cards
├── hooks/
│   └── useFavoriteLists.js            # Comprehensive React Query queries and mutations
├── services/
│   └── favoriteListService.js         # REST client for /v1/favorite-lists endpoints
├── favoriteListConstants.js           # Paging limits, character limits, and error strings
└── index.js                           # Module exports
```

### Component Roles & Invariants
- **Multi-Membership Invariant:** A listing can belong to multiple favorite lists at the same time. The `AddToListModal` checks existing associations using `useListsContainingListing`.
- **Privacy Enforcement:** Private lists are only accessible by the list owner; unauthorized access attempts on `FavoriteListDetailPage` render the not found error state.
- **Copy Link Feedback:** Public list sharing copies the canonical URL to the system clipboard and triggers a success notification.

---

## 4. State Management & React Query Contract

### Query Keys & Cache Matrix
| Query Key | Scope | Stale Time | Garbage Collection | Invalidation Triggers |
|---|---|---|---|---|
| `['favoriteLists', 'my', userId, page, size]` | Current user's created lists | 30 sec (`30000ms`) | 5 min (`300000ms`) | List creation, deletion, or metadata update |
| `['favoriteLists', 'user', userId, isOwn, page, size]` | Profile public lists | 1 min (`60000ms`) | 5 min (`300000ms`) | List updates or profile navigation |
| `['favoriteLists', listId]` | Single list metadata and items | 30 sec (`30000ms`) | 5 min (`300000ms`) | Item addition, removal, or like toggle |
| `['favoriteLists', 'containing', listingId]` | Lists containing specific listing | 30 sec (`30000ms`) | 5 min (`300000ms`) | `useAddItemToList` / `useRemoveItemFromList` |
| `['favoriteLists', 'popular']` | Popular public collections | 1 min (`60000ms`) | 5 min (`300000ms`) | Like / unlike mutations |

### Hooks Contract
- `useMyFavoriteLists(page, size)`: Queries lists owned by the current authenticated user.
- `useUserFavoriteLists(userId, isOwnProfile, options, page, size)`: Fetches lists for a specific user profile.
- `useFavoriteListById(listId)`: Loads list details and contained items.
- `useListsContainingListing(listingId)`: Returns `{ listIds: [...] }` to pre-check checkboxes in `AddToListModal`.
- `useCreateFavoriteList()` / `useUpdateFavoriteList()` / `useDeleteFavoriteList()`: Mutations managing list lifecycle.
- `useAddItemToList()` / `useRemoveItemFromList()`: Item membership mutations.
- `useLikeFavoriteList()` / `useUnlikeFavoriteList()`: Social list appreciation mutations.

---

## 5. Form & Data Validation Rules

Constraints enforced by `FAVORITE_LIST_MODAL_LIMITS`:
- **List Name:** Mandatory non-empty string, maximum 100 characters (`NAME_MAX`). Trimmed on submission.
- **Description:** Optional string, maximum 500 characters (`DESCRIPTION_MAX`).
- **Item Note:** Optional custom note when adding an item to a list (e.g., "Compare price with Seller B").

---

## 6. UX States, Backend Error Contract & Restrained Design Tokens

### 4-State UX Handling
1. **Loading State:** `FavoriteListDetailPage` displays skeleton card grids for listing contents and skeleton text bars for list description.
2. **Empty State:** When a list contains no items, displays an empty collection container with a folder icon and copy prompting the user to discover listings.
3. **Error State:** In case of non-existent list or unauthorized private list, renders `NOT_FOUND_TITLE` (`"List not found"`) and a `"Go back"` button.
4. **Data State:** Rich folder view with creator avatar, public/private badge, total items counter, and grid of listing cards with status overlays (`Sold`, `Inactive`).

### Backend Error Contract
- Handled through `handleError` and `extractSuccessMessage`.
- Known codes:
  - `FAVORITE_LIST_NOT_FOUND`: Triggers 404 not found page state.
  - `UNAUTHORIZED_LIST_ACCESS`: Handled when attempting to view another member's private folder.

### Restrained Design Tokens
- **Privacy Badges:** Subtle pill badges: `bg-surface-alt text-muted-foreground border-border` for Private, `bg-primary/10 text-primary` for Public.
- **Borders & Radii:** Strict `rounded-md` on collection cards and action buttons.
- **Colors:** Neutral monochrome palette with functional accent icons; zero celebratory confetti or emoji graphics.
