# Escrow Domain

## Purpose
The `escrow` domain manages the "safe trade" fund flow, securing funds from the buyer and releasing them to the seller only after delivery confirmation.

## Architecture Overview
- **EscrowService:** Core service that coordinates hold, release, and refund logic.
- **Unified Payment Record:** The escrow system shares records with the `payment` domain rather than duplicating them. A payment with `status=ESCROW` serves as the escrow record.
- **Transactional Outbox & Kafka Flow:** Releasing escrow (`release`) enqueues an `ESCROW_RELEASED` event into `escrow_outbox_events` in the same database transaction. `EscrowOutboxWorker` dispatches the event to the `escrow.released.v1` Kafka topic, and `EscrowKafkaConsumer` asynchronously credits the seller's wallet (`creditWalletQuietly`).

## Business Invariants & Constraints
- **Unified Ledger:** Escrow holding does not create a new `Payment` record; it relies on the `PaymentProcessor` setting the status to `ESCROW`.
- **Release Semantics:** Releasing escrow transitions the payment status to `COMPLETED` and queues an outbox event. The seller's wallet is credited asynchronously via Kafka consumer with idempotency.
- **Refund Window:** Escrow can only be refunded/cancelled *before* it is released. Once released, the funds belong to the seller and cannot be refunded by the escrow system.
- **Refund Destination:** Escrow refunds are routed back to the buyer's system wallet, never involving the seller.

## State Machine
```mermaid
stateDiagram-v2
    [*] --> ESCROW: Held (Order Placed)
    ESCROW --> COMPLETED: Released (Order Delivered -> Outbox -> Kafka -> Wallet Credited)
    ESCROW --> REFUNDED: Refunded (Order Issue)
    ESCROW --> CANCELLED: Cancelled (Order Cancelled)
```

## Integration Points
- **Incoming:** Triggered heavily by the `order` domain during checkout and delivery lifecycle.
- **Outgoing:** Produces `escrow.released.v1` Kafka events via `EscrowOutboxWorker`. Consumed by `EscrowKafkaConsumer`.
- **Outbox Table:** `escrow_outbox_events`

