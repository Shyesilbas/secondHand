# Favorite Domain

## Purpose
The `favorite` domain allows users to bookmark listings, manage favorites lists, aggregate engagement statistics, and enables sellers to broadcast private discounted offers to favoriters.

## Architecture Overview
- **FavoriteService:** Coordinates adding, removing, and toggling favorites, and dispatches broadcast offers to favoriters.
- **ListingAccessService:** Enforces prerequisites (e.g., listing must be active) before allowing a favorite action.
- **FavoriteStatsService:** Provides single and batch projections for favorite counts to minimize database load.

## Business Invariants & Constraints
- **Active State Requirement:** A listing must be in the `ACTIVE` state to be favorited.
- **Ownership Limitation:** Users cannot favorite their own listings.
- **Atomicity:** Adding a favorite relies on a unique database constraint `(user_id, listing_id)`. Removing relies on an atomic `delete...IfExists` query rather than an `exists` followed by a `delete`.
- **Fail-Safe Notifications:** Failing to send a favorite notification must not cause the favorite database transaction to roll back.
- **Broadcast Private Offers:** Only the listing owner can broadcast discounted offers to users who have favorited their listing (`FavoriterBroadcastRequest`).

## State Machines
- **Favorite Action:** Toggled (Exists / Does Not Exist).

## Integration Points
- **Incoming:** HTTP requests via `FavoriteController`.
- **Outgoing:** Triggers notifications when an item is favorited or when a seller broadcasts a private offer.

## Public APIs
- `POST /api/v1/favorites`: Adds a listing to user favorites.
- `DELETE /api/v1/favorites/{listing-id}`: Removes a listing from user favorites.
- `POST /api/v1/favorites/toggle`: Toggles favorite status (adds if absent, removes if present).
- `GET /api/v1/favorites`: Paginated list of favorited listings for the authenticated user.
- `GET /api/v1/favorites/stats/{listing-id}`: Favorite count and whether the caller favorited the item.
- `POST /api/v1/favorites/stats`: Batch favorite stats for a list of listing UUIDs.
- `GET /api/v1/favorites/check/{listing-id}`: Boolean check if current user favorited the listing.
- `GET /api/v1/favorites/count/{listing-id}`: Total favorite count for a listing.
- `GET /api/v1/favorites/ids`: List of all listing IDs favorited by the current user.
- `GET /api/v1/favorites/top`: Top favorited listings across the platform.
- `GET /api/v1/favorites/top-listings`: Top favorited listings enriched with full listing details.
- `POST /api/v1/favorites/listings/{listing-id}/broadcast-offer`: Seller broadcasts a discounted offer to all favoriters.

## Related Knowledge
- **Modify Favorite Rules**
  -> `.docs/runbooks/modify-favorite-rules.md`
