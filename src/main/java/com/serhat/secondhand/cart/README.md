# Cart Domain

## Purpose
The `cart` domain provides a lightweight, optimistic shopping cart service. It manages addition, modification, and deletion of items with zero database row locking, deferring strict atomic stock reservations to the `checkout` domain via Redis Lua scripts.

## Architecture Overview
- **CartService:** Core business logic handling cart additions, quantity updates, item removals, metadata enrichment, and demand tracking.
- **CartValidator:** Validates user eligibility (cannot buy own items), listing active state, and available stock.
- **CartReservationScheduler:** Periodically checks reservation consistency.
- **Two-Tier Stock Model:** Cart additions operate optimistically without holding pessimistic database locks or blocking other shoppers. Hard atomic stock reservation is executed during the checkout step via `InventoryRedisReservationService` (Redis Lua).

## Business Invariants & Constraints
- **Ownership Limitation:** Users cannot add their own listings to their cart.
- **Listing Status:** Items added to the cart must be in an `ACTIVE` state.
- **Zero DB Lock Contention:** Adding to cart does not acquire `PESSIMISTIC_WRITE` locks on listings or inventory, protecting the database during high-traffic flash sales and preventing Cart Hoarding DoS attacks.
- **Social Demand Tracking:** Active items in user carts update the Redis Set `v4:cart:in_cart_users:{listingId}` to power live shopping demand statistics.
- **Parallel Mutations:** Concurrent additions or updates that trigger DB unique constraint conflicts are intercepted and converted into standard business errors (`RESERVATION_FAILED`), not technical 500s.

## Integration Points
- **Incoming:** User actions via `CartController`.
- **Outgoing:** Validates listing state via the `listing` domain query APIs. Provides items to the `checkout` domain.

## Public APIs
- `GET /api/v1/cart`: Retrieves authenticated user's cart items, subtotal, and valid discounts.
- `POST /api/v1/cart/items`: Adds a listing item to the cart.
- `PUT /api/v1/cart/items/{listing-id}`: Updates quantity for an item in the cart.
- `DELETE /api/v1/cart/items/{listing-id}`: Removes a single item from the cart.
- `DELETE /api/v1/cart/items`: Clears all items from the user's cart.
- `GET /api/v1/cart/count`: Returns count of items in the user's cart.
- `GET /api/v1/cart/check/{listing-id}`: Checks if a listing is currently in the user's cart.
- `GET /api/v1/cart/reservations/count/{listing-id}`: Returns count of active reservations for a listing.

## Related Knowledge
- **Cart Feature Development**
  -> `.docs/runbooks/cart-feature-runbook.md`
