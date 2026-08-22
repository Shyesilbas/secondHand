# Checkout Domain

## Purpose
The `checkout` domain acts as the orchestration layer that ties together the cart, offers, stock reservations, order creation, and payment execution to finalize a purchase.

## Architecture Overview
- **CheckoutOrchestrator:** The central nervous system of the purchase flow.
- **CheckoutPricingContextFactory:** Calculates the final payable amount considering active cart items, accepted offers, and applied coupons.
- **CheckoutStockReservationService:** Handles reserving stock atomically in Redis via Lua scripts (`reserve_stock_with_ttl.lua`) with an automatic 15-minute TTL per user, and supports instant explicit cancellation or success consumption.

## Business Invariants & Constraints
- **Atomic Execution:** The entire checkout sequence must be robust against partial failures. If payment fails, Redis stock reservations must be strictly released.
- **Lock-Free Stock Reservation with TTL:** Stock reservation operates entirely in-memory via atomic Redis Lua scripts (`reserve_stock_with_ttl.lua` / `cancel_user_reservation.lua`), eliminating DB pessimistic lock bottlenecks and auto-releasing after 15 minutes if the user abandons checkout.
- **Escrow Default:** Upon successful payment, funds must be deposited into the Escrow wallet; they are never directly credited to the seller during checkout.

## State Machines
- **Checkout Execution Flow:** Pricing -> Atomic Redis TTL Stock Reservation -> Order Creation -> Payment Execution -> Escrow Transfer / Rollback -> Kafka Event Emission.

## Integration Points
- **Incoming:** HTTP requests for checkout initiation and reservation cancellation.
- **Outgoing:** Queries `cart` or `offer` for items. Executes payments via `payment`. Creates orders via `order`.

## Public APIs
- `POST /api/checkout/initiate`: Atomically reserves user's cart items in Redis with a 15-minute TTL when entering checkout.
- `POST /api/orders/checkout`: Finalizes order and processes payment.
- `DELETE /api/checkout/reservation/{listingId}`: Explicitly cancels user's temporary stock reservation and restores stock to Redis.

## Related Knowledge
- *(No specific runbooks extracted; modifications usually require coordinating changes across `order`, `payment`, and `cart`)*
