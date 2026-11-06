# Order Domain

## Purpose
The `order` domain manages the end-to-end lifecycle of a purchase: order creation, state progression, completion, cancellation, refund, and escrow resolution.

## Architecture Overview
- **Rich Domain Model:** The `Order` entity centralizes core state transition logic.
- **Policy Engine:** `policy` classes govern the validity of state transitions (e.g., is this order eligible for cancellation?).
- **Service Orchestration:** Application services (`OrderCreationService`, `OrderModificationService`) execute policies and coordinate repositories.
- **Automated Progression:** `OrderCompletionScheduler` automatically advances order states based on time thresholds.
- **AOP Logging:** `OrderLogAspect` intercepts and logs all API requests and mutations.

## Business Invariants & Constraints
- **Policy Centricity:** Invalid state transitions must be rejected by policy rules, not by service-level checks.
- **Escrow Dependency:** Order completion cannot be finalized unless the underlying escrow release operation is successful.
- **Item-Based Compensation:** Order cancellation and refund decisions mandate an item-by-item compensation plan (`OrderItemCompensationPlanner`).
- **Post-Commit Side Effects:** Event emissions (`OrderCancelledEvent`, `OrderRefundedEvent`) happen strictly after the core order transaction has committed.
- **One Seller Per Order:** Checkout creates one order per seller (`OrderCreationService.createOrders`); shipping, status and escrow are per order, so an order never mixes sellers. Order amounts come from the priced items of that seller and are set after the items are added (`Order.addItem` recalculates totals from item prices that are already net of the coupon share).
- **Ship Deadline:** Shipping is the seller's action only. A paid `CARGO` order still `CONFIRMED`/`PROCESSING` `SHIP_DEADLINE_HOURS` (72h) after creation is cancelled by `OrderCompletionScheduler` through `OrderCancellationService.cancelUnshippedOrder` (stock restore, escrow refund, `OrderCancelledEvent` with `shipDeadlineMissed`, outbox event).
- **Payment Orchestration:** `order` makes the decision to refund or cancel, but the execution of fund transfers is delegated to the `payment` orchestrator.

## State Machine
```mermaid
stateDiagram-v2
    [*] --> PENDING: Shipping order created
    [*] --> MEETUP_PENDING: Safe Meetup order created
    PENDING --> CONFIRMED: Payment success
    CONFIRMED --> PROCESSING: Auto after 5 min
    PROCESSING --> SHIPPED: Seller ships
    PROCESSING --> CANCELLED: Not shipped within 72h (system)
    SHIPPED --> DELIVERED: Delivery confirmed
    DELIVERED --> COMPLETED: Buyer confirms / auto after 72h
    DELIVERED --> REFUNDED: Refund within 48h of delivery

    PENDING --> CANCELLED
    CONFIRMED --> CANCELLED
    MEETUP_PENDING --> CANCELLED

    MEETUP_PENDING --> HANDOVER_CONFIRMED: OTP / QR verified
    MEETUP_PENDING --> VERIFICATION_LOCKED: 3 failed attempts (15 min lock)
    VERIFICATION_LOCKED --> MEETUP_PENDING: Lock expired
    HANDOVER_CONFIRMED --> COMPLETED: Buyer confirms / auto after 24h
```
Authoritative rules: `Order` entity methods, `OrderStatus` (cancellable / refundable / completable sets), the `policy` classes and `OrderCompletionScheduler`. Safe Meetup details: `docs/safe-meetup-delivery-and-verification.md`.

## List API
- `GET /api/v1/orders` (buyer) and `GET /api/v1/orders/seller` take optional `deliveryMethod`, `statuses` (comma-separated `OrderStatus`, unknown value -> 400) and `orderNumber` (exact match). Filters are bundled in `OrderListFilter`; no status filter means every status.
- `GET /api/v1/orders/status-counts` and `/orders/seller/status-counts` return `[{status, count}]` for the same scope (used for list tab badges).

## Integration Points
- **Incoming:** Checkout Domain (triggers order creation).
- **Outgoing:** Payment Domain (called for escrow release/refund execution), Shipping Domain (called for tracking updates).
- **Events:** Publishes `OrderCancelledEvent`, `OrderRefundedEvent`, etc.

## Related Knowledge
- **Modify State Rule**
  -> `.docs/runbooks/modify-state-rule.md`

- **Modify Refund/Cancellation Behavior**
  -> `.docs/runbooks/modify-refund-behavior.md`

- **Add Order Endpoint**
  -> `.docs/runbooks/add-order-endpoint.md`

- **Order Feature Development**
  -> `.docs/runbooks/order-feature-runbook.md`
