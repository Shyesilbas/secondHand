# Favorite Lists UI Module

Custom user-curated listing folders, public list sharing, and multi-list bookmarking.

## Architecture

- **`FavoriteListDetailPage`:** Dedicated detail page (`/favorites/lists/:id`) displaying listings collected within a specific curated list, with public sharing support.
- **Modals & Cards:**
  - `FavoriteListModal`: Dialog for creating or editing list name, description, and visibility (`PUBLIC` vs `PRIVATE`).
  - `AddToListModal`: Multi-checkbox dialog enabling users to add or remove a listing across multiple curated lists at once.
  - `FavoriteListCard`: Card component summarizing list title, item count, and cover preview.
- **`useFavoriteLists`:** React Query hook managing list queries and item association mutations.
- **`favoriteListService`:** API service managing `/v1/favorite-lists/*` endpoints.

## Invariants

- **Multi-List Association:** A single listing can belong to multiple distinct favorite lists simultaneously.
- **Cache Synchronization:** Adding or removing listings from a list invalidates both `['favoriteLists']` and `['favoriteList', id]` queries.
- **Restrained Styling:** Strict compliance with `.agents/skills/restrained-ui-design-standard/SKILL.md`: clean folder cards, accessible checkbox lists, and zero emojis.

