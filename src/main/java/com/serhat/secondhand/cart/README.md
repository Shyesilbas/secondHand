# Cart Domain

## Purpose
The `cart` domain provides a lightweight, optimistic shopping cart service. It manages addition, modification, and deletion of items with zero database row locking, deferring strict atomic stock reservations to the `checkout` domain via Redis Lua scripts.

## Architecture Overview
- **CartService:** Core business logic handling cart additions, quantity updates, item removals, and metadata enrichment.
- **CartValidator:** Validates user eligibility (cannot buy own items) and listing active state.
- **Two-Tier Stock Model:** Cart additions operate optimistically without holding pessimistic database locks or blocking other shoppers. Hard atomic stock reservation is executed during the checkout step via `InventoryRedisReservationService` (Redis Lua).

## Business Invariants & Constraints
- **Ownership Limitation:** Users cannot add their own listings to their cart.
- **Listing Status:** Items added to the cart must be in an `ACTIVE` state.
- **Zero DB Lock Contention:** Adding to cart does not acquire `PESSIMISTIC_WRITE` locks on listings or inventory, protecting the database during high-traffic flash sales and preventing Cart Hoarding DoS attacks.
- **Parallel Mutations:** Concurrent additions or updates that trigger DB unique constraint conflicts are intercepted and converted into standard business errors (`RESERVATION_FAILED`), not technical 500s.

## Integration Points
- **Incoming:** User actions via `CartController`.
- **Outgoing:** Validates listing state via the `listing` domain query APIs. Provides items to the `checkout` domain.

## Public APIs
- `GET /api/cart`
- `POST /api/cart/add`, `PUT /api/cart/update`, `DELETE /api/cart/remove`

## Related Knowledge
- **Cart Feature Development**
  -> `.docs/runbooks/cart-feature-runbook.md`
