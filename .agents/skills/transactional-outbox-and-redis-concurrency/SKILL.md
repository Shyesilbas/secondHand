---
name: transactional-outbox-and-redis-concurrency
description: Use this skill whenever modifying financial flows (payment, escrow, ewallet, order, checkout), Kafka producers/consumers, outbox workers, Redis Lua stock/coupon reservations, concurrency locks, or multi-tier Redis caching. Enforces ACID transactional outbox guarantees, consumer idempotency, Lua atomicity, and cache eviction discipline.
---

# Transactional Outbox, Financial Safety & Redis Concurrency

Follow these rules whenever working on money flows (`checkout`, `order`, `payment`, `escrow`, `ewallet`, `coupon`, `pricing`), stock (`inventory`, `cart`, `offer`), Kafka messaging, or Redis caching.

## 1. Financial Flow & Escrow Invariants
- **Core Money Pipeline:** `checkout` -> `order` -> `payment` -> `escrow` -> seller `ewallet`.
- **Single Idempotency Entry Point:** Payment idempotency (`idempotencyKey + fromUserId`) resides strictly inside `PaymentProcessor`. Never leak idempotency or outbox logic into individual `PaymentProviderPort` adapters (`EWalletPaymentProviderAdapter`).
- **Pre-Check Separation:** Agreements, user eligibility, and OTP verification codes (`verificationCode`) must be validated in `PaymentPreCheckService` before transaction execution.
- **Unified Escrow Record:** Escrow shares the payment record (`PaymentStatus.ESCROW` -> `COMPLETED` / `REFUNDED`); never create parallel payment records for escrow holds.
- **Order vs. Payment Responsibility:** `order` acts only as the state machine decision-maker (governed by `policy` classes) and never executes fund transfers directly. Refunds are permitted only within `REFUND_WINDOW_HOURS=48h` of delivery and only if escrow has not yet been released; delivered orders auto-complete after `AUTO_COMPLETION_HOURS=72h`.
- **No Silent Fallbacks:** In `auth`, `payment`, `escrow`, `ewallet`, `order`, and `inventory`, never guess behavior or swallow errors. Always fail with an explicit domain error-code enum (`PaymentErrorCodes`, `OrderErrorCodes`, etc.) and a clean `@Transactional` rollback path.

## 2. Transactional Outbox & Kafka Consumer Idempotency
- **No Dual-Writes in Transactions:** Never publish directly to Kafka inside a `@Transactional` business method.
- **Outbox Enqueueing:** Persist domain state changes and enqueue the corresponding event into the domain outbox table (`payment_outbox_events`, `order_outbox_events`, `escrow_outbox_events`) within the same PostgreSQL transaction. Dedicated scheduled outbox workers (`PaymentOutboxWorker`, `EscrowOutboxWorker`, `OrderOutboxWorker`) poll pending rows, publish to Kafka (`payment.completed.v1`, `escrow.released.v1`, etc.), and mark rows `PROCESSED`.
- **Commit-Safe Deduplication:** Any in-process or post-payment side effect must run in the `AFTER_COMMIT` phase (`TransactionSynchronizationManager` or `@TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)`), never before the main transaction commits.
- **ACID Consumer Idempotency:** Every Kafka consumer (`InventoryKafkaConsumer`, `PaymentCompletedKafkaConsumer`, `EscrowKafkaConsumer`) must deduplicate incoming events via the database-level `processed_kafka_events` table (`INSERT ... ON CONFLICT DO NOTHING`) inside the consumer transaction, and guard against missing foreign keys (e.g., deleted/non-existent listings) before mutating state.

## 3. Redis 7 Lua Atomic Operations & Stock Reconciliation
- **No DB Row Locks for Hot Contention:** Avoid `SELECT ... FOR UPDATE` on high-contention cart/coupon paths. Use atomic Redis Lua scripts under `src/main/resources/scripts/`:
  - `reserve_stock_with_ttl.lua` / `reserve_stock.lua`: 15-minute anti-hoarding cart stock reservation TTL.
  - `release_stock.lua` / `cancel_user_reservation.lua`: Immediate atomic reservation release on cart removal or checkout cancellation.
  - `apply_coupon_with_limit.lua`: Atomic redemption quota enforcement.
- **Async Stock Decrement & Auto-Healing:** Physical PostgreSQL stock is decremented asynchronously via `InventoryKafkaConsumer` after payment completion. Background stock reconciliation sweepers repair any drift between Redis reservations and PostgreSQL inventory.
- **Dedicated Redis TTL Locks & Social Proof:**
  - Accepted offers lock the listing for the buyer for 24 hours via `v4:offer:lock:{listingId}`.
  - Active showcase promotions use `v4:listing:showcase:active:{listingId}`.
  - Social proof metrics ("Active In Carts", 24h ZSET unique viewers, 12h favorite count cache) must use sub-millisecond Redis lookups or indexed queries (`idx_cart_listing`) without frontend polling loops.

## 4. Multi-Tier Redis Caching & Invalidation Discipline
- **Redis-Only Spring Cache:** All `@Cacheable` lookups use Redis (`v4:<cacheName>:` key prefix from `CacheConfig.CACHE_VERSION`, tiered TTLs and Jackson polymorphic serialization). Do not configure Caffeine as a Spring `@Cacheable` L1 manager (`Caffeine` is only permitted for local rate/attempt tracking in `LoginAttemptService`).
- **Mandatory Eviction Matrix:** Every write, update, state transition, or seed path that mutates cached data must explicitly evict or refresh the affected Redis keys (`@CacheEvict`, `CatalogSeedStartupRunner` clearing `catalog:*`, or explicit `RedisTemplate` eviction). See `docs/multi-tier-redis-caching-and-invalidation.md`.

## 5. Verification Checklist
1. Does any `@Transactional` method call Kafka or external HTTP APIs directly before commit?
2. Is the Kafka consumer idempotent via `processed_kafka_events` and tested against duplicate delivery?
3. Are parallel reservation/coupon conflicts handled atomically via Lua and mapped to `400` business errors rather than `500` server errors?
4. Are concurrency changes verified with `./mvnw test -Dmaven.test.skip=false -Dtest=ConcurrentStockAndPaymentIntegrationTest` (or the relevant module test)?
