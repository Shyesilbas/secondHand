# Payment / Stock / Escrow Backend Audit

## Recheck Result
Mostly fixed. The controller boundary is better now, the payment outbox flow is cleaner, and Kafka consumer idempotency is now atomic at the DB level. The remaining concern is stock lifecycle policy around missing inventory and TTL expiry.

## General Assessment
Payment is the strongest part: Redis idempotency, transactional processing, and outbox publishing are in place. Stock reservation is atomic via Lua, but the TTL flow still looks unsafe. Escrow has transactional persistence and outbox publishing, but consumer-side deduplication is only partially addressed.

## Class Map

| Package | Main classes | Assessment |
|---|---|---|
| `payment` | `PaymentController`, `PaymentProcessor`, `OrderPaymentService`, `PaymentPreCheckService`, `PaymentValidator`, `PaymentKafkaProducer`, `PaymentOutboxWorker`, `PaymentRedisIdempotencyService`, `PaymentCompletedKafkaConsumer` | Stronger now; producer is clean and consumer idempotency is atomic in the database. |
| `inventory` | `InventoryService`, `InventoryRedisReservationService`, `InventoryKafkaConsumer` | Lua reservation is fine, and consumer idempotency is atomic in the database. |
| `checkout` | `CheckoutOrchestrator`, `CheckoutStockReservationService`, `CheckoutReservationController` | Better now; the controller delegates the use case. |
| `escrow` | `EscrowService`, `EscrowOutboxService`, `EscrowOutboxWorker`, `EscrowKafkaProducer`, `EscrowKafkaConsumer`, `Escrow` | Transactional flow is good, and consumer idempotency is atomic in the database. |

## Fixed Since Last Review

| Area | Status | Note |
|---|---|---|
| Payment outbox publish | Fixed | Worker now waits for Kafka send completion before marking the row processed. |
| Checkout controller boundary | Fixed | Cart lookup moved into `CheckoutStockReservationService`. |
| Payment producer repository coupling | Fixed | `PaymentKafkaProducer` no longer queries `OrderItemRepository`. |
| Inventory duplicate delivery guard | Fixed | Database-level insert-if-not-exists is atomic. |
| Escrow duplicate delivery guard | Fixed | Database-level insert-if-not-exists is atomic. |

## Still Open Issues

| Issue | Class / Layer | Risk | Why it still matters |
|---|---|---:|---|
| Stock fallback policy is ambiguous | `InventoryService.getAvailableQuantity` | Medium | Missing inventory returns `1` for ACTIVE listings, which may be intentional but is still a hidden policy choice. |
| Inventory expiry/reconciliation is incomplete | `reserve_stock_with_ttl.lua`, `InventoryRedisReservationService` | Medium | TTL reservation cleanup is still not paired with a reconciliation/sweeper path, and the stock key TTL can let availability drift. |

## Layer Analysis

### Payment
Core payment flow is structurally good. The outbox and consumer dedupe flows now look aligned.

### Stock / Inventory
The Lua script is atomic, and the controller path is cleaner. The remaining question is policy: whether an ACTIVE listing without an inventory row should really imply quantity `1`.

### Escrow
Escrow persistence and outbox publishing are aligned with the architecture, and the consumer dedupe is now ACID-safe.

## Transaction / Security Risk

| Area | Finding |
|---|---|
| Payment | Outbox durability improved; consumer dedupe is now ACID-safe. |
| Stock | Atomic reservation exists; fallback/reconciliation policy needs confirmation. |
| Escrow | DB transaction is fine; consumer dedupe is now ACID-safe. |
| Kafka | Publish completion is better; the remaining issue is stock lifecycle, not delivery dedupe. |

## Priority Order

1. Confirm the intended policy for ACTIVE listings without an inventory row.
2. Add inventory reconciliation/sweeper if TTL reservations are meant to expire safely.
3. Consider removing the `stockKey` TTL if stock should persist independently of reservations.

## Overall Verdict
Mostly correct now. The main remaining risk is stock lifecycle correctness, not payment/escrow delivery safety.
