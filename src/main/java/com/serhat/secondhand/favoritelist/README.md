# FavoriteList Domain

## Purpose
The `favoritelist` domain enables users to create and curate named collections of listings (Favorite Lists), manage list privacy, and allow other users to "like" public lists.

## Architecture Overview
- **FavoriteListService:** Enforces business rules regarding list size, user list counts, and privacy.
- **Projections:** Summary endpoints (`FavoriteListSummaryProjection`) compute sizes and likes directly in the database, avoiding loading massive item collections into application memory.

## Business Invariants & Constraints
- **Capacity Limits:** A user cannot exceed `maxListsPerUser`, and a list cannot exceed `maxItemsPerList`. These limits are verified via fast `count` queries.
- **Uniqueness:** A listing can only be added to a list once. A user can only like a list once. A user cannot have multiple lists with the same name.
- **Privacy Rules:** Private lists cannot be viewed by other users, nor can they be "liked" by anyone (including the owner).
- **Ownership Exclusion:** A user is not permitted to "like" their own public list.

## State Machines
- **List Privacy:** Public / Private.

## Integration Points
- **Incoming:** HTTP CRUD interactions from users managing their collections.
- **Outgoing:** Links to listings within the `listing` domain.

## Public APIs
- List CRUD, Item Add/Remove, List Like/Unlike, Summary Endpoints (Popular, My Lists).

## Related Knowledge
- **Modify FavoriteList Behavior**
  -> `.docs/runbooks/modify-favoritelist-behavior.md`
