# FavoriteList Domain

Enables users to curate named collections of listings (`favorite_lists`, `favorite_list_items`, `favorite_list_likes`), control public/private visibility, and like public community collections.

> [!NOTE]
> **Related Documentation & Runbooks:**
> - **Architecture Deep Dive:** [`docs/social-proof-and-urgency-metrics-architecture.md`](/docs/social-proof-and-urgency-metrics-architecture.md)
> - **Frontend Module:** [`secondhand-frontend/src/favoritelist/README.md`](/secondhand-frontend/src/favoritelist/README.md)
> - **Key Entry Points:** [`FavoriteListController`](api/FavoriteListController.java) · [`FavoriteListService`](application/FavoriteListService.java) · [`FavoriteListMapper`](mapper/FavoriteListMapper.java)

## Business Rules & Invariants
- **Capacity & Uniqueness Quotas (`FavoriteListConfig`, `FavoriteListErrorCodes`):**
  - Max lists per user: `countByOwner >= maxListsPerUser` -> `FAVORITE_LIST_LIMIT_EXCEEDED`.
  - Unique list name per owner: `UNIQUE (user_id, name)` -> `FAVORITE_LIST_NAME_EXISTS`.
  - Max items per list: `countByFavoriteList >= maxItemsPerList` -> `FAVORITE_LIST_ITEM_LIMIT_EXCEEDED`.
  - Unique listing per list: `UNIQUE (favorite_list_id, listing_id)` -> `FAVORITE_LIST_ITEM_ALREADY_EXISTS`.
- **Visibility & Like Rules:**
  - Private lists (`is_public = false`) are visible only to their owner (`FAVORITE_LIST_PRIVATE`) and cannot be liked (`CANNOT_LIKE_PRIVATE_LIST`).
  - Public lists (`is_public = true`) can be viewed by anyone and liked once per authenticated non-owner (`UNIQUE (favorite_list_id, user_id)`, `CANNOT_LIKE_OWN_LIST`, `ALREADY_LIKED`).
- **Projection Queries:** List feeds use `FavoriteListSummaryProjection` in PostgreSQL to compute item and like counts without hydrating collections in memory.
- **Change rule:** Validate counts with a DB `count` query, never `collection.size()` on a lazy relation; let the unique constraint (`DataIntegrityViolationException`) settle races.

## API (`FavoriteListController`, `/api/v1/favorite-lists`)
- `POST /` · `PUT /{list-id}` · `DELETE /{list-id}` — create, update metadata/visibility, or delete an owned list.
- `GET /my` · `GET /user/{user-id}` · `GET /popular` · `GET /{list-id}` — paginated owned lists, user public lists, popular public lists by like count, and full list detail (`FavoriteListDto`).
- `POST /{list-id}/items` & `DELETE /{list-id}/items/{listing-id}` — add or remove a listing.
- `POST /{list-id}/like` & `DELETE /{list-id}/like` — like or unlike a public list.
- `GET /listing/{listing-id}/lists` — IDs of the current user's lists containing `listing-id`.
