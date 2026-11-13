# Inventory Domain

Manages listing stock (`inventory` table) and high-concurrency reservations using atomic Redis Lua scripts (`InventoryRedisReservationService`), asynchronous PostgreSQL stock deduction via Kafka (`InventoryKafkaConsumer`), and periodic drift healing (`StockReservationReconciliationScheduler`).

> [!NOTE]
> **Related Documentation & Runbooks:**
> - **Architecture Deep Dive:** [`docs/stock-reservation-and-reconciliation.md`](/docs/stock-reservation-and-reconciliation.md) (sequence flow, Lua script logic, reconciliation math)
> - **Architecture Deep Dive:** [`docs/checkout-pipeline-and-distributed-transaction-flow.md`](/docs/checkout-pipeline-and-distributed-transaction-flow.md)
> - **Frontend Module:** [`secondhand-frontend/src/cart/README.md`](/secondhand-frontend/src/cart/README.md)
> - **Key Entry Points:** [`InventoryService`](application/InventoryService.java) · [`InventoryRedisReservationService`](application/InventoryRedisReservationService.java) · [`InventoryKafkaConsumer`](application/InventoryKafkaConsumer.java) · [`StockReservationReconciliationScheduler`](application/StockReservationReconciliationScheduler.java)

## Business Rules & Invariants
- **Zero Over-Selling without DB Row Locks:** Stock checks and holds run as single-threaded Redis Lua scripts rather than `SELECT ... FOR UPDATE`.
- **Anti-Hoarding TTL:** Checkout holds (`v4:inventory:reservation:{userId}:{listingId}`) expire after `DEFAULT_RESERVATION_TTL_SECONDS` (900s / 15m, `app.checkout.reservation-ttl-seconds`).
- **Idempotent Async DB Deduction (`ITEM_PURCHASE` Only):** `InventoryKafkaConsumer` consumes `payment.completed.v1`, deduplicates via `ProcessedKafkaEventRepository` (`processed_kafka_events`), deducts PostgreSQL stock only when `transactionType == ITEM_PURCHASE` (listing/showcase fee payments never touch stock), clears the `v4:inventory:pending:` marker after commit, and flips the listing to `ListingStatus.SOLD` when stock reaches `0`.
- **Compare-And-Set Drift Healing:** `StockReservationReconciliationScheduler` computes expected Redis stock (`PostgreSQL availableQuantity - active reservations - pending purchases`) after observing the current stock key first, then writes via `compare_and_set_stock.lua` so concurrent reservations made during the scan are never overwritten.

## Redis, Lua Scripts & Kafka
- **Redis Keys:**
  - `v4:inventory:stock:{listingId}` — unreserved available stock counter.
  - `v4:inventory:reservation:{userId}:{listingId}` — user checkout hold with TTL.
  - `v4:inventory:pending:{orderItemId}:{listingId}` — paid quantity awaiting Kafka DB deduction (written after checkout commit, removed after consumer commit; 24h safety-net TTL).
- **Lua Scripts (`src/main/resources/scripts/`):**
  - `reserve_stock_with_ttl.lua` (check `>= qty`, init from DB if absent, decrement stock, write reservation with `EXPIRE`; `-1` if insufficient) & `reserve_stock.lua` (no-TTL fallback).
  - `cancel_user_reservation.lua` (delete user reservation and increment stock if stock key exists).
  - `release_stock.lua` (increment existing stock key on order cancel/refund).
  - `compare_and_set_stock.lua` (reconciliation CAS write).
- **Kafka Consumer:** `InventoryKafkaConsumer` on topic `payment.completed.v1`.
