# Payment / Stock / Escrow Backend Audit

## Recheck Result
Mostly fixed, but not fully closed. The controller boundary is better now and the payment outbox flow is cleaner. The remaining high-risk gap is Kafka consumer idempotency: the current Redis `hasKey()` check is not atomic, so duplicate deliveries can still race.

## General Assessment
Payment is the strongest part: Redis idempotency, transactional processing, and outbox publishing are in place. Stock reservation is atomic via Lua, but the TTL flow still looks unsafe. Escrow has transactional persistence and outbox publishing, but consumer-side deduplication is only partially addressed.

## Class Map

| Package | Main classes | Assessment |
|---|---|---|
| `payment` | `PaymentController`, `PaymentProcessor`, `OrderPaymentService`, `PaymentPreCheckService`, `PaymentValidator`, `PaymentKafkaProducer`, `PaymentOutboxWorker`, `PaymentRedisIdempotencyService`, `PaymentCompletedKafkaConsumer` | Stronger now; producer is clean, but consumer idempotency still uses a non-atomic read-before-work pattern. |
| `inventory` | `InventoryService`, `InventoryRedisReservationService`, `InventoryKafkaConsumer` | Lua reservation is fine, and dedupe is deferred until after commit, but the idempotency guard is still race-prone. |
| `checkout` | `CheckoutOrchestrator`, `CheckoutStockReservationService`, `CheckoutReservationController` | Better now; the controller delegates the use case. |
| `escrow` | `EscrowService`, `EscrowOutboxService`, `EscrowOutboxWorker`, `EscrowKafkaProducer`, `EscrowKafkaConsumer`, `Escrow` | Transactional flow is good, but the Redis dedupe guard is still non-atomic. |

## Fixed Since Last Review

| Area | Status | Note |
|---|---|---|
| Payment outbox publish | Fixed | Worker now waits for Kafka send completion before marking the row processed. |
| Checkout controller boundary | Fixed | Cart lookup moved into `CheckoutStockReservationService`. |
| Payment producer repository coupling | Fixed | `PaymentKafkaProducer` no longer queries `OrderItemRepository`. |
| Inventory duplicate delivery guard | Partially fixed | After-commit marking helps rollback safety, but not concurrent duplicate races. |
| Escrow duplicate delivery guard | Partially fixed | Same limitation as inventory. |

## Still Open Issues

| Issue | Class / Layer | Risk | Why it still matters |
|---|---|---:|---|
| Consumer idempotency is not atomic | `PaymentCompletedKafkaConsumer`, `InventoryKafkaConsumer`, `EscrowKafkaConsumer` | High | `hasKey()` is only a read check; two consumers can pass it concurrently and both process the same event. |
| Stock fallback policy is ambiguous | `InventoryService.getAvailableQuantity` | Medium | Missing inventory returns `1` for ACTIVE listings, which may be intentional but is still a hidden policy choice. |
| Inventory expiry/reconciliation is incomplete | `reserve_stock_with_ttl.lua`, `InventoryRedisReservationService` | Medium | TTL reservation cleanup is still not paired with a reconciliation/sweeper path. |

## Layer Analysis

### Payment
Core payment flow is structurally good. The remaining concern is not the transaction itself, but duplicate event handling on the consumer side and the hard-coded cross-layer lookup in the producer.

### Stock / Inventory
The Lua script is atomic, and the controller path is cleaner. The remaining question is policy: whether an ACTIVE listing without an inventory row should really imply quantity `1`.

### Escrow
Escrow persistence and outbox publishing are aligned with the architecture, but the current dedupe guard is not atomic.

## Transaction / Security Risk

| Area | Finding |
|---|---|
| Payment | Outbox durability improved; consumer dedupe still races. |
| Stock | Atomic reservation exists; fallback/reconciliation policy needs confirmation. |
| Escrow | DB transaction is fine; consumer dedupe still races. |
| Kafka | Publish completion is better; idempotency still needs an atomic claim pattern. |

## Priority Order

1. Replace `hasKey()` checks with an atomic claim/inbox pattern for all Kafka consumers.
2. Confirm the intended policy for ACTIVE listings without an inventory row.
3. Add inventory reconciliation/sweeper if TTL reservations are meant to expire safely.

## Overall Verdict
Better than before, but not yet fully safe for high-concurrency duplicate delivery. The remaining blocker is atomic consumer idempotency, not the core business flow.
