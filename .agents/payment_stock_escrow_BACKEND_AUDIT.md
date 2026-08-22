# Payment / Stock / Escrow Backend Audit

## Recheck Result
Not fully fixed yet. The high-level architecture is still solid, but a few correctness gaps remain in Redis expiry, Kafka consumer idempotency, and controller/service boundaries.

## General Assessment
Payment is the strongest part: Redis idempotency, transactional processing, and outbox publishing are in place. Stock reservation is atomic via Lua, but the TTL flow still looks unsafe. Escrow has transactional persistence and outbox publishing, but consumer-side deduplication is only partially addressed.

## Class Map

| Package | Main classes | Assessment |
|---|---|---|
| `payment` | `PaymentController`, `PaymentProcessor`, `OrderPaymentService`, `PaymentPreCheckService`, `PaymentValidator`, `PaymentKafkaProducer`, `PaymentOutboxWorker`, `PaymentRedisIdempotencyService`, `PaymentCompletedKafkaConsumer` | Better now, but notification/event consumers still need dedupe hardening. |
| `inventory` | `InventoryService`, `InventoryRedisReservationService`, `InventoryKafkaConsumer` | Lua reservation is good, but expiry/retry semantics are still risky. |
| `checkout` | `CheckoutOrchestrator`, `CheckoutStockReservationService`, `CheckoutReservationController` | Orchestration is fine; controller is still doing too much. |
| `escrow` | `EscrowService`, `EscrowOutboxService`, `EscrowOutboxWorker`, `EscrowKafkaProducer`, `EscrowKafkaConsumer`, `Escrow` | Transactional flow is good, but Kafka consumer idempotency is not fully safe. |

## Fixed Since Last Review

| Area | Status | Note |
|---|---|---|
| Payment outbox publish | Fixed | Worker now waits for Kafka send completion before marking the row processed. |
| Inventory duplicate delivery guard | Partially fixed | A Redis guard was added, but failure/rollback semantics are still not safe enough. |
| Escrow duplicate delivery guard | Partially fixed | Same pattern as inventory; better, but still not fully reliable under commit failure. |

## Still Open Issues

| Issue | Class / Layer | Risk | Why it still matters |
|---|---|---:|---|
| TTL does not restore real inventory state | `reserve_stock_with_ttl.lua`, `InventoryService.getAvailableQuantity` | High | Expired reservations only expire keys; the DB stock source still falls back to `1` when Redis key is missing. That can re-seed wrong stock. |
| Redis default stock fallback is unsafe | `InventoryService.getAvailableQuantity` | High | Missing inventory should fail closed, not auto-create or default to one unit. |
| Consumer idempotency is not commit-safe | `InventoryKafkaConsumer`, `EscrowKafkaConsumer` | High | Redis dedupe keys are written before transactional work completes; a DB rollback or commit failure can still leave a processed marker behind. |
| Payment notification consumer is still not deduped | `PaymentCompletedKafkaConsumer` | Medium | Duplicate `payment.completed` delivery can still duplicate notifications/handler side effects. |
| Checkout controller is not fully thin | `CheckoutReservationController` | Medium | It still loads cart data and branches on emptiness instead of delegating that use case to a service. |
| Cross-domain repository access remains in producer | `PaymentKafkaProducer` | Medium | The producer still queries `OrderItemRepository`; quantity should come from the use-case layer. |

## Layer Analysis

### Payment
Core payment flow is structurally good. The remaining concern is not the transaction itself, but duplicate event handling on the consumer side and the hard-coded cross-layer lookup in the producer.

### Stock / Inventory
The Lua script is atomic, but the lifecycle is inconsistent. Expiry removes the reservation signal, yet the system still lacks a trustworthy stock reconciliation path. The `getAvailableQuantity()` fallback is the biggest red flag.

### Escrow
Escrow persistence and outbox publishing are aligned with the architecture, but message re-delivery is still not fully safe if the consumer side is interrupted after the Redis dedupe mark is set.

## Transaction / Security Risk

| Area | Finding |
|---|---|
| Payment | Outbox durability improved; consumer duplication remains. |
| Stock | Atomic reservation exists; expiry/reconciliation is still incorrect. |
| Escrow | DB transaction is fine; duplicate delivery handling is only partially safe. |
| Kafka | Publish completion is better, but consumer idempotency needs stronger guarantees. |

## Priority Order

1. Fix inventory expiry/reconciliation so stock cannot be silently re-seeded or lost.
2. Replace consumer-side Redis pre-marking with commit-safe inbox/idempotency handling.
3. Add dedupe protection to `PaymentCompletedKafkaConsumer`.
4. Move cart lookup out of `CheckoutReservationController`.
5. Remove repository lookup from `PaymentKafkaProducer`.

## Overall Verdict
Better than before, but not yet “fully fixed.” Payment is mostly good now; inventory and consumer idempotency still need one more pass before I’d call this safe for high-concurrency production use.
