# FavoriteList Domain

## Purpose
The `favoritelist` domain enables users to create and curate named collections of listings (Favorite Lists), manage list privacy, and allow other users to "like" public lists.

## Architecture Overview
- **FavoriteListService:** Enforces business rules regarding list size, user list counts, and privacy.
- **Projections:** Summary endpoints (`FavoriteListSummaryProjection`) compute sizes and likes directly in the database, avoiding loading massive item collections into application memory.
- **Configuration:** `FavoriteListConfig` governs page size constraints and capacity defaults.

## Business Invariants & Constraints
- **Capacity Limits:** A user cannot exceed `maxListsPerUser`, and a list cannot exceed `maxItemsPerList`. These limits are verified via fast `count` queries.
- **Uniqueness:** A listing can only be added to a list once. A user can only like a list once. A user cannot have multiple lists with the same name.
- **Privacy Rules:** Private lists cannot be viewed by other users, nor can they be "liked" by anyone (including the owner).
- **Ownership Exclusion:** A user is not permitted to "like" their own public list.

## State Machines
- **List Privacy:** Public / Private.

## Integration Points
- **Incoming:** HTTP requests via `FavoriteListController`.
- **Outgoing:** References listings within the `listing` domain.

## Public APIs
- `POST /api/v1/favorite-lists`: Creates a new favorite list.
- `GET /api/v1/favorite-lists/my`: Paginated list of current user's collections.
- `GET /api/v1/favorite-lists/user/{user-id}`: Paginated public lists for a specific user.
- `GET /api/v1/favorite-lists/popular`: Popular public lists ordered by likes count.
- `GET /api/v1/favorite-lists/{list-id}`: Detailed view of a favorite list and its items.
- `PUT /api/v1/favorite-lists/{list-id}`: Updates name, description, or privacy status.
- `DELETE /api/v1/favorite-lists/{list-id}`: Deletes a favorite list.
- `POST /api/v1/favorite-lists/{list-id}/items`: Adds a listing to the list.
- `DELETE /api/v1/favorite-lists/{list-id}/items/{listing-id}`: Removes an item from the list.
- `POST /api/v1/favorite-lists/{list-id}/like`: Likes a public list.
- `DELETE /api/v1/favorite-lists/{list-id}/like`: Unlikes a list.
- `GET /api/v1/favorite-lists/listing/{listing-id}/lists`: Returns user's list IDs containing a specific listing.

## Related Knowledge
- **Modify FavoriteList Behavior**
  -> `.docs/runbooks/modify-favoritelist-behavior.md`
