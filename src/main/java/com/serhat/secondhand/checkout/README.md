# Checkout Domain

## Purpose
The `checkout` domain acts as the orchestration layer that ties together the cart, offers, stock reservations, order creation, and payment execution to finalize a purchase.

## Architecture Overview
- **CheckoutOrchestrator:** The central nervous system of the purchase flow.
- **CheckoutPricingContextFactory:** Calculates the final payable amount considering active cart items, accepted offers, and applied coupons.
- **CheckoutStockReservationService:** Handles reserving stock during the checkout window and rolling it back if the payment fails.

## Business Invariants & Constraints
- **Atomic Execution:** The entire checkout sequence must be robust against partial failures. If payment fails, stock reservations must be strictly released.
- **Escrow Default:** Upon successful payment, funds must be deposited into the Escrow wallet; they are never directly credited to the seller during checkout.

## State Machines
- **Checkout Execution Flow:** Pricing -> Reservation -> Order Creation -> Payment Execution -> Escrow Transfer / Rollback -> Event Emission.

## Integration Points
- **Incoming:** HTTP requests for checkout initiation.
- **Outgoing:** Queries `cart` or `offer` for items. Executes payments via `payment`. Creates orders via `order`.

## Public APIs
- `/api/checkout/execute`

## Related Knowledge
- *(No specific runbooks extracted; modifications usually require coordinating changes across `order`, `payment`, and `cart`)*
