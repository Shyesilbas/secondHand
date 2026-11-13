# Cart Domain

Manages buyer shopping carts (`carts` table, unique on `(user_id, listing_id)`) with optimistic browsing: adding or updating items checks inventory without locking database rows or holding Redis stock, while tracking real-time social demand in Redis and enriching cart reads via `ListingEnrichmentService`.

> [!NOTE]
> **Related Documentation & Runbooks:**
> - **Architecture Deep Dive:** [`docs/stock-reservation-and-reconciliation.md`](/docs/stock-reservation-and-reconciliation.md) (browsing vs. checkout stock tiers)
> - **Architecture Deep Dive:** [`docs/checkout-pipeline-and-distributed-transaction-flow.md`](/docs/checkout-pipeline-and-distributed-transaction-flow.md)
> - **Frontend Module:** [`secondhand-frontend/src/cart/README.md`](/secondhand-frontend/src/cart/README.md)
> - **Key Entry Points:** [`CartController`](api/CartController.java) · [`CartService`](application/CartService.java) · [`CartValidator`](validator/CartValidator.java) · [`CartSocialMetricService`](application/CartSocialMetricService.java)

## Business Rules & Invariants
- **Two-Tier Stock Model (No Cart Locks):** Adding or updating cart items verifies positive PostgreSQL stock (`AVAILABLE_STOCK_INSUFFICIENT`) without taking `PESSIMISTIC_WRITE` DB locks or Redis stock holds. Hard stock reservation happens only when entering checkout (`CheckoutStockReservationService`).
- **Self-Purchase Prevention:** Buyers cannot add their own listings to the cart (`CANNOT_ADD_OWN_LISTING`).
- **Active Listing Requirement:** Only `ListingStatus.ACTIVE` items can be added or checked out.
- **Quantity Floor & Concurrency:** Quantities must be `>= 1` (setting `0` deletes the item). Concurrent writes (`DataIntegrityViolationException`, `ObjectOptimisticLockingFailureException`) are translated into clean `Result` responses.
- **Change rule:** New rules go into `CartValidator`; tunables bind under `app.cart.*` (`CartConfig`).

## Redis, Outbox & Kafka
- `v4:cart:in_cart_users:{listingId}` (Redis Set, 7-day TTL in `CartSocialMetricService`) — tracks distinct user IDs holding the listing in their cart to power *"In X people's cart"* urgency metrics without DB aggregation.

## API (`CartController`, `/api/v1/cart`)
- `GET /` — paginated cart items enriched with seller badges, showcase flags, and favorite status.
- `POST /items` — add a listing to the cart (`AddToCartRequest`).
- `PUT /items/{listingId}` — update item quantity (`UpdateCartItemRequest`).
- `DELETE /items/{listingId}` — remove a single item from the cart.
- `DELETE /items` — clear the authenticated user's cart.
- `GET /count` — total item count for the header cart badge.
- `GET /check/{listingId}` — boolean check whether a listing is in the user's cart.
- `GET /reservations/count/{listingId}` — active reservation count for a listing.
