# Payment / Stock / Escrow Backend Audit

## Recheck Result
Mostly fixed. The controller boundary is better now, the payment outbox flow is cleaner, and inventory/escrow consumers now defer dedupe marking until after commit. The main remaining risk is payment consumer dedupe, plus the stock fallback/reconciliation design.

## General Assessment
Payment is the strongest part: Redis idempotency, transactional processing, and outbox publishing are in place. Stock reservation is atomic via Lua, but the TTL flow still looks unsafe. Escrow has transactional persistence and outbox publishing, but consumer-side deduplication is only partially addressed.

## Class Map

| Package | Main classes | Assessment |
|---|---|---|
| `payment` | `PaymentController`, `PaymentProcessor`, `OrderPaymentService`, `PaymentPreCheckService`, `PaymentValidator`, `PaymentKafkaProducer`, `PaymentOutboxWorker`, `PaymentRedisIdempotencyService`, `PaymentCompletedKafkaConsumer` | Stronger now; producer is clean, but payment consumer still pre-marks Redis dedupe before business work completes. |
| `inventory` | `InventoryService`, `InventoryRedisReservationService`, `InventoryKafkaConsumer` | Lua reservation is fine, and consumer dedupe is after-commit now, but fallback stock semantics still need policy clarity. |
| `checkout` | `CheckoutOrchestrator`, `CheckoutStockReservationService`, `CheckoutReservationController` | Better now; the controller delegates the use case. |
| `escrow` | `EscrowService`, `EscrowOutboxService`, `EscrowOutboxWorker`, `EscrowKafkaProducer`, `EscrowKafkaConsumer`, `Escrow` | Transactional flow is good, and consumer dedupe now happens after commit. |

## Fixed Since Last Review

| Area | Status | Note |
|---|---|---|
| Payment outbox publish | Fixed | Worker now waits for Kafka send completion before marking the row processed. |
| Checkout controller boundary | Fixed | Cart lookup moved into `CheckoutStockReservationService`. |
| Payment producer repository coupling | Fixed | `PaymentKafkaProducer` no longer queries `OrderItemRepository`. |
| Inventory duplicate delivery guard | Fixed | Dedupe marking now waits until after commit. |
| Escrow duplicate delivery guard | Fixed | Dedupe marking now waits until after commit. |

## Still Open Issues

| Issue | Class / Layer | Risk | Why it still matters |
|---|---|---:|---|
| Payment consumer dedupe is not commit-safe | `PaymentCompletedKafkaConsumer` | High | It still writes the Redis processed marker before handler/notification work, so a rollback can drop the event. |
| Stock fallback policy is ambiguous | `InventoryService.getAvailableQuantity` | Medium | Missing inventory returns `1` for ACTIVE listings, which may be intentional but is still a hidden policy choice. |
| Inventory expiry/reconciliation is incomplete | `reserve_stock_with_ttl.lua`, `InventoryRedisReservationService` | Medium | TTL reservation cleanup is still not paired with a reconciliation/sweeper path. |

## Layer Analysis

### Payment
Core payment flow is structurally good. The remaining concern is not the transaction itself, but duplicate event handling on the consumer side and the hard-coded cross-layer lookup in the producer.

### Stock / Inventory
The Lua script is atomic, and the controller path is cleaner. The remaining question is policy: whether an ACTIVE listing without an inventory row should really imply quantity `1`.

### Escrow
Escrow persistence and outbox publishing are aligned with the architecture, and consumer dedupe is now commit-safe.

## Transaction / Security Risk

| Area | Finding |
|---|---|
| Payment | Outbox durability improved; payment consumer remains the weak spot. |
| Stock | Atomic reservation exists; fallback/reconciliation policy needs confirmation. |
| Escrow | DB transaction is fine; consumer handling is now safer. |
| Kafka | Publish completion is better; only payment consumer dedupe remains clearly unsafe. |

## Priority Order

1. Make `PaymentCompletedKafkaConsumer` commit-safe.
2. Confirm the intended policy for ACTIVE listings without an inventory row.
3. Add inventory reconciliation/sweeper if TTL reservations are meant to expire safely.

## Overall Verdict
Better than before, but not yet “fully fixed.” Payment is mostly good now; inventory and consumer idempotency still need one more pass before I’d call this safe for high-concurrency production use.
