# Checkout Domain

Orchestrates converting a buyer's cart (and optional accepted offer) into seller-partitioned orders, reserving stock atomically in Redis, executing payments, locking buyer funds in escrow, redeeming coupons, and clearing the cart inside a single `@Transactional` boundary (`CheckoutOrchestrator.executeCheckout`).

> [!NOTE]
> **Related Documentation & Runbooks:**
> - **Architecture Deep Dive:** [`docs/checkout-pipeline-and-distributed-transaction-flow.md`](/docs/checkout-pipeline-and-distributed-transaction-flow.md) (end-to-end transaction steps, rollback hooks, multi-seller partitioning)
> - **Architecture Deep Dive:** [`docs/stock-reservation-and-reconciliation.md`](/docs/stock-reservation-and-reconciliation.md)
> - **Frontend Module:** [`secondhand-frontend/src/cart/README.md`](/secondhand-frontend/src/cart/README.md) · [`secondhand-frontend/src/payments/README.md`](/secondhand-frontend/src/payments/README.md)
> - **Key Entry Points:** [`CheckoutOrchestrator`](application/CheckoutOrchestrator.java) · [`CheckoutPricingContextFactory`](application/CheckoutPricingContextFactory.java) · [`CheckoutStockReservationService`](application/CheckoutStockReservationService.java) · [`CheckoutReservationController`](api/CheckoutReservationController.java)

## Business Rules & Invariants
- **Single-Transaction Multi-Seller Atomicity:** Cart items are partitioned by seller into separate `Order` rows (`OrderCreationService`). Either all seller orders succeed, are paid (`OrderPaymentService`), and enter escrow (`EscrowService.hold`) together, or the entire transaction rolls back (`rollbackCheckout`) and releases all held Redis stock.
- **No Silent Coupon Dropping:** `CheckoutPricingContextFactory` calls `IPricingService.priceCartForCheckout`. If an entered coupon is invalid, expired, or depleted, checkout halts immediately with the `CouponErrorCodes` entry; an order is never created at a higher price than the buyer approved.
- **Offer Override:** When `offerId` is supplied, `IOfferService.getAcceptedOfferForCheckout` validates the accepted offer and replaces the cart line's quantity and price (`OfferPriceHandler`), bypassing seller campaigns on that line.
- **Lock-Free Stock Reservation & Rollback Hook:** `CheckoutStockReservationService` checks `ListingStatus.ACTIVE` and calls `InventoryRedisReservationService.reserveStockWithTtl` (`app.checkout.reservation-ttl-seconds`). On `afterCommit`, reservations convert to pending purchase markers (`consumeReservationsOnSuccess`); on `STATUS_ROLLED_BACK`, a `TransactionSynchronization` hook releases Redis stock immediately.
- **Default Escrow:** Buyer funds never go directly to the seller at checkout; orders start in `OrderStatus.MEETUP_PENDING` (`DeliveryMethod.SAFE_MEETUP`) or `OrderStatus.CONFIRMED` (`CARGO`) with funds held in escrow.
- **Post-Payment Finalization:** Redeems the coupon once against the primary discounted order (`CouponService.redeem`), marks any accepted offer `OfferStatus.COMPLETED`, deletes the buyer's cart, and publishes `OrderCreatedEvent` after commit.

## Redis, Outbox & Kafka
- Delegates stock reservation keys (`v4:inventory:reservation:{userId}:{listingId}`, `v4:inventory:stock:{listingId}`, `v4:inventory:pending:{orderItemId}:{listingId}`) and Lua scripts to [`inventory/README.md`](../inventory/README.md).

## API
- `POST /api/checkout/initiate` (`CheckoutReservationController`) — reserves cart stock in Redis for the checkout timer window.
- `DELETE /api/checkout/reservation/{listingId}` (`CheckoutReservationController`) — cancels a user's held stock reservation.
- `POST /api/v1/orders/checkout` (`OrderController`) — executes full checkout (`CheckoutRequest` -> `CheckoutResultDto`).
