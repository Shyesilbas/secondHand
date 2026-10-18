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
- **Payment Orchestration:** `order` makes the decision to refund or cancel, but the execution of fund transfers is delegated to the `payment` orchestrator.

## State Machine
```mermaid
stateDiagram-v2
    [*] --> PENDING: Shipping order created
    [*] --> MEETUP_PENDING: Safe Meetup order created
    PENDING --> CONFIRMED: Payment success
    CONFIRMED --> PROCESSING: Seller prepares
    PROCESSING --> SHIPPED: Seller ships
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
