# Favorite Domain

## Purpose
The `favorite` domain allows users to mark individual listings as favorites, managing the toggling logic and aggregating favorite counts for statistical display.

## Architecture Overview
- **FavoriteService:** Coordinates the adding, removing, and toggling of favorites, while enforcing caching boundaries.
- **ListingAccessService:** Enforces prerequisites (e.g., listing must be active) before allowing a favorite action.
- **FavoriteStatsService:** Provides single and batch projections for favorite counts to minimize database load.

## Business Invariants & Constraints
- **Active State Requirement:** A listing must be in the `ACTIVE` state to be favorited.
- **Ownership Limitation:** Users are strictly prevented from favoriting their own listings.
- **Atomicity:** Adding a favorite relies on a unique database constraint `(user_id, listing_id)`. Removing relies on an atomic `delete...IfExists` query rather than an `exists` followed by a `delete`.
- **Fail-Safe Notifications:** Failing to send a favorite notification must not cause the favorite database transaction to roll back.

## State Machines
- **Favorite Action:** Toggled (Exists / Does Not Exist).

## Integration Points
- **Incoming:** User interaction via the Favorite Controller.
- **Outgoing:** Triggers notifications when an item is favorited.

## Public APIs
- Toggle Favorite, Add Favorite, Remove Favorite, Get User Favorites, Get Stats.

## Related Knowledge
- **Modify Favorite Rules**
  -> `.docs/runbooks/modify-favorite-rules.md`
