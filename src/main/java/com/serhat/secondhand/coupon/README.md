# Coupon Domain

## Purpose
The `coupon` domain manages platform-wide promotional discounts, user redemption limits, audience targeting, and high-concurrency coupon validation and reservation.

## Architecture Overview
- **CouponService:** Core service handling coupon discovery, preview calculations, validity checks, and redemption persistence.
- **CouponRedisLimiterService:** Enforces atomic rate-limiting and usage quotas using Redis Lua scripts (`apply_coupon_with_limit.lua` and `release_coupon_usage.lua`) before persisting to PostgreSQL.
- **CouponValidator:** Enforces creation and update rules (percentage/fixed value bounds, positive minimum cart amounts, date ranges).
- **CouponMapper:** Maps entities (`Coupon`, `CouponRedemption`) to DTOs.
- **AdminCouponService / AdminCouponController:** Administrative control plane for creating, modifying, and monitoring coupons and audience metrics.

## Business Invariants & Constraints
- **Atomic Concurrency Quotas:** Global and per-user redemption limits are atomically validated in Redis via Lua scripting prior to PostgreSQL commit. If Redis is unavailable, the system safely falls back to database validation under row locks.
- **Category Exclusions:** Vehicles (`VEHICLE`) and Real Estate (`REAL_ESTATE`) listings are strictly excluded from coupon discounts.
- **Audience Targeting:** Coupons can target `ALL_USERS`, `NEW_USERS` (registered within the new-user threshold), or `FIRST_ORDER_ONLY` (users without prior completed orders).
- **Cart Eligibility:** A coupon requires a cart total (applicable non-excluded items) meeting or exceeding `minCartAmount`.
- **Discount Types:** Supports `PERCENT` (up to 100%) and `FIXED` amount discounts.
- **Idempotent Single Redemption:** A coupon can only be redeemed once per purchase flow, linked to the primary order in checkout.

## Redis Key Structure & Lua Scripts
- **Global Usage Counter:** `v4:coupon:usage:global:{code}` — Tracks overall redemptions across all users.
- **User Usage Counter:** `v4:coupon:usage:user:{code}:{userId}` — Tracks redemptions by a specific user.
- **Scripts:**
  - `scripts/apply_coupon_with_limit.lua`: Atomically checks and increments global and per-user counters.
  - `scripts/release_coupon_usage.lua`: Compensates and decrements counters on checkout rollback or cancellation.

## Integration Points
- **Incoming:** HTTP requests via `CouponController` and `AdminCouponController`.
- **Outgoing:** Invoked by `pricing` (`PriceCalculationEngine`) and `checkout` (`CheckoutPricingContextFactory`) during order finalization.

## Public APIs
- `POST /api/v1/coupons/preview`: Calculates applicable discount amount and checks eligibility for a cart.
- `GET /api/v1/coupons/active`: Returns active coupons accessible to the current authenticated user.
- `GET /api/v1/coupons/redemptions`: Returns current user redemption history.
- `GET /api/v1/admin/coupons`: Paginated list of coupons with optional status filters (admin).
- `POST /api/v1/admin/coupons`: Creates a new coupon definition (admin).
- `PUT /api/v1/admin/coupons/{id}`: Updates an existing coupon (admin).
- `GET /api/v1/admin/coupons/audience-stats`: Audience reach and usage statistics (admin).
