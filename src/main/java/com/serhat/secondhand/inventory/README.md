# Inventory Domain

## Purpose
The `inventory` domain manages product stock levels, atomic in-memory stock reservations, and asynchronous persistence synchronization across checkout and payment lifecycles.

## Architecture Overview
- **InventoryService:** Core domain service managing PostgreSQL `inventory` entity state and operations.
- **InventoryRedisReservationService:** High-performance stock reservation engine using atomic Redis Lua scripts (`reserve_stock_with_ttl.lua` and `cancel_user_reservation.lua`). Supports a 15-minute TTL per user reservation and eliminates database row-level locking bottlenecks.
- **InventoryKafkaConsumer:** Asynchronously listens to `payment.completed.v1` Kafka topic to apply final inventory deductions to the PostgreSQL database and update listing statuses when out of stock.

## Business Invariants & Constraints
- **Atomic Stock Reservation with TTL:** Stock reservation during checkout is performed in-memory via Redis Lua scripts with an automatic 15-minute TTL (`reserve_stock_with_ttl.lua`) to prevent over-selling and hoarding attacks.
- **Auto & Explicit Stock Restoration:** If a payment fails, a checkout session aborts, or the 15-minute TTL expires, reserved stock in Redis is restored immediately via `cancel_user_reservation.lua`.
- **Eventual Consistency:** Permanent DB stock updates occur asynchronously upon receiving `PaymentCompletedKafkaEvent` via Kafka.
- **Auto Listing Sold Out:** When an item's remaining inventory reaches `0`, its `ListingStatus` in the `listings` table is automatically transitioned to `SOLD`.

## Integration Points
- **Incoming (Checkout):** `CheckoutStockReservationService` interacts with `InventoryRedisReservationService` to hold/release items during checkout.
- **Incoming (Kafka):** `InventoryKafkaConsumer` consumes `PaymentCompletedKafkaEvent` from `payment.completed.v1` topic to finalize stock deduction.
