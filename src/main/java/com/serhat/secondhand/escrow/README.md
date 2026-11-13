# Escrow Domain

Holds buyer purchase funds in custody (`escrows` table, one row per `OrderItem`) upon checkout and either releases them to the seller's eWallet via transactional outbox + Kafka after delivery completion, or refunds them to the buyer on order cancellation/refund.

> [!NOTE]
> **Related Documentation & Runbooks:**
> - **Architecture Deep Dive:** [`docs/escrow-lifecycle-and-state-machine.md`](/docs/escrow-lifecycle-and-state-machine.md) (state transitions, hold/release/refund flows)
> - **Architecture Deep Dive:** [`docs/checkout-pipeline-and-distributed-transaction-flow.md`](/docs/checkout-pipeline-and-distributed-transaction-flow.md)
> - **Frontend Module:** [`secondhand-frontend/src/payments/README.md`](/secondhand-frontend/src/payments/README.md) · [`secondhand-frontend/src/order/README.md`](/secondhand-frontend/src/order/README.md)
> - **Key Entry Points:** [`EscrowService`](application/EscrowService.java) · [`EscrowOutboxService`](outbox/EscrowOutboxService.java) · [`EscrowOutboxWorker`](outbox/EscrowOutboxWorker.java) · [`EscrowKafkaConsumer`](application/EscrowKafkaConsumer.java)

## Business Rules & Invariants
- **Item-Level Escrow Ledger (`EscrowService.hold`):** Writes one `Escrow` row per `OrderItem` (unique on `order_item_id`) with net post-campaign/post-coupon `amount`, audit snapshot fields (`listingTitle`, `listingNo`), and `PaymentStatus.ESCROW`, then evicts `payment:stats`. Never create a second `payments` row to represent the hold.
- **Pre-Release Refund Boundary (`EscrowService.refund`):** Reversals to `PaymentStatus.REFUNDED` (crediting the buyer's eWallet) are permitted only while in `PaymentStatus.ESCROW`. Once released to `COMPLETED`, funds belong to the seller and cannot be clawed back via escrow.
- **Outbox-Decoupled Seller Payout (`EscrowService.releaseEscrowForOrder`):** Order completion marks `Escrow` rows `PaymentStatus.COMPLETED` (`releasedAt = now()`) and enqueues an `ESCROW_RELEASED` event into `escrow_outbox_events` in the same ACID transaction without mutating the seller's wallet synchronously.
- **Fail-Loud Idempotent Consumer (`EscrowKafkaConsumer`):** Consumes `escrow.released.v1`, validates required event fields (`PaymentErrorCodes.ESCROW_RELEASE_EVENT_INVALID` routes malformed events to `escrow.released.v1.DLT` after retries), deduplicates via `ProcessedKafkaEventRepository` (`escrow:release:{escrowId}` in `processed_kafka_events`), and credits the seller via `IEWalletService.creditWalletQuietly`.
- **Change rule:** Refunds are possible only while the escrow row is unreleased, and always go to the buyer.

## Redis, Outbox & Kafka
- Cache eviction: `@CacheEvict` on `payment:stats` when escrow state changes.
- Outbox: `escrow_outbox_events`, polled by `EscrowOutboxWorker` (`app.escrow.outbox.fixed-delay-ms`).
- Kafka topic: `escrow.released.v1` (`EscrowReleasedKafkaEvent`), consumed by `EscrowKafkaConsumer`.
