# Payment / Stock / Escrow Backend Audit

## General Assessment
The direction is strong: payment uses Redis idempotency plus outbox, stock uses Redis Lua for atomic reservation, and escrow is wrapped in transactional service methods with a Kafka outbox. The main problem is not structure, but correctness at the boundaries: reservation expiry, duplicate Kafka delivery, and transaction ordering still leave a few high-risk gaps.

## Class Map

| Package | Main classes | Assessment |
|---|---|---|
| `payment` | `PaymentController`, `PaymentProcessor`, `OrderPaymentService`, `PaymentPreCheckService`, `PaymentValidator`, `PaymentKafkaProducer`, `PaymentOutboxWorker`, `PaymentRedisIdempotencyService`, `PaymentCompletedKafkaConsumer` | Mostly well-layered, but there are transaction/idempotency coupling risks. |
| `inventory` | `InventoryService`, `InventoryRedisReservationService`, `InventoryKafkaConsumer` | Lua reservation is good, but stock sync and event deduplication are weak points. |
| `checkout` | `CheckoutOrchestrator`, `CheckoutStockReservationService`, `CheckoutReservationController` | Orchestration is clear, but the controller is not fully thin. |
| `escrow` | `EscrowService`, `EscrowOutboxService`, `EscrowOutboxWorker`, `EscrowKafkaProducer`, `EscrowKafkaConsumer`, `Escrow` | Transactional shape is good, but outbox publish and consumer idempotency need tightening. |

## Detected Issues

| Issue | Class / Layer | Risk | Proposed Solution |
|---|---|---:|---|
| Missing inventory is treated as `1` | `InventoryService.getAvailableQuantity`, `InventoryRedisReservationService`, Lua scripts | High | Fail closed when inventory is missing. Seed Redis explicitly from DB/admin sync instead of auto-creating stock as `1`. |
| Reservation TTL does not restore stock | `reserve_stock_with_ttl.lua`, `CheckoutStockReservationService`, `InventoryRedisReservationService` | High | Add an expiry compensation path (scheduled sweeper or expiry index). TTL should not be the only cleanup mechanism. |
| Redis idempotency can outlive DB rollback | `PaymentProcessor`, `OrderPaymentService` | High | Mark idempotency as completed only after the enclosing transaction commits, or move the completion write to an after-commit hook/outbox step. |
| Outbox event marked processed before Kafka success is durable | `PaymentOutboxWorker`, `EscrowOutboxWorker`, `PaymentKafkaProducer`, `EscrowKafkaProducer` | High | Wait for send completion before marking PROCESSED, or use a transactional producer path with explicit success confirmation. |
| Kafka consumers are not idempotent | `InventoryKafkaConsumer`, `EscrowKafkaConsumer` | High | Store processed message IDs and skip duplicates. Current consumers can double-decrement stock or double-credit wallet on re-delivery. |
| Controller is not fully thin | `CheckoutReservationController` | Medium | Move cart loading and empty-cart branching into a service. Controller should only bind HTTP and delegate. |
| Cross-domain repository access in payment publishing | `PaymentKafkaProducer` | Medium | Pass quantity from the payment/use-case layer instead of querying `OrderItemRepository` inside the producer. |

## Layer Analysis

### Payment
The payment pipeline is the best-structured part of the audit: validation, pre-checks, transaction processing, notification dispatch, and outbox publication are separated. The weak point is consistency between the DB transaction and the Redis idempotency state. Right now, Redis can be marked completed before the outer checkout transaction is fully committed.

### Stock / Inventory
The Redis Lua scripts are the right idea for atomic stock changes. The problem is lifecycle management: the TTL reservation only removes the reservation key, not the stock decrement. Without a reconciliation process, abandoned reservations permanently reduce stock.

### Escrow
Escrow is transactional and the outbox pattern is applied correctly at a high level. The risk is operational: once messages are consumed, there is no inbox/idempotency guard, so duplicate Kafka delivery can repeat wallet credit or inventory-side actions.

## Transaction / Security Risk

| Area | Finding |
|---|---|
| Payment | Idempotency is strong, but completion timing is unsafe relative to the outer transaction. |
| Stock | Atomic decrement is good, but TTL-based reservation expiry is incomplete. |
| Escrow | Database state is protected, but consumer-side deduplication is missing. |
| Kafka | Producer/worker flow logs success, but event durability is not proven before marking outbox rows processed. |

## Priority Order

1. Fix stock reservation expiry so reserved inventory is restored safely.
2. Make payment idempotency completion happen after the surrounding transaction commits.
3. Add consumer idempotency for `payment.completed` and `escrow.released` processing.
4. Harden outbox workers so "processed" means Kafka publish is actually durable.
5. Move cart lookup out of `CheckoutReservationController` and remove cross-domain repository access from the payment producer.

## Overall Verdict
Conceptually good and mostly well-separated, but not yet fully safe for high-concurrency production use. The biggest correctness gaps are reservation expiry, duplicate event handling, and transaction/event ordering.
