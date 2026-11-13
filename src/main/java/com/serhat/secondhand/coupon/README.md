# Coupon Domain

Manages platform promotional coupons (`coupons`, `coupon_eligible_users`, `coupon_eligible_types`, `coupon_redemptions`), audience rules, and atomic checkout redemptions combining Redis Lua quota limiters with PostgreSQL `FOR UPDATE` row locks.

> [!NOTE]
> **Related Documentation & Runbooks:**
> - **Architecture Deep Dive:** [`docs/pricing-coupon-and-campaign-architecture.md`](/docs/pricing-coupon-and-campaign-architecture.md) (discount kinds, proportional allocation, redemption sequence)
> - **Frontend Module:** [`secondhand-frontend/src/coupon/README.md`](/secondhand-frontend/src/coupon/README.md) · [`secondhand-frontend/src/admin/README.md`](/secondhand-frontend/src/admin/README.md)
> - **Key Entry Points:** [`CouponController`](api/CouponController.java) · [`AdminCouponController`](api/AdminCouponController.java) · [`CouponService`](application/CouponService.java) · [`CouponValidator`](validator/CouponValidator.java) · [`CouponRedisLimiterService`](application/CouponRedisLimiterService.java)

## Business Rules & Invariants
- **Discount Kinds & Audiences:** Supports `CouponDiscountKind` (`ORDER_PERCENT`, `ORDER_FIXED`, `TYPE_PERCENT`, `TYPE_FIXED`, `THRESHOLD_FIXED`, `THRESHOLD_PERCENT`) and `CouponAudience` (`ALL_USERS`, `USER_ID_LIST`, `NEVER_ORDERED_FIRST_ORDER`).
- **Vertical Exclusion & Post-Campaign Base:** `ListingType.REAL_ESTATE` and `ListingType.VEHICLE` are excluded (`COUPON_NOT_APPLICABLE`). `minSubtotal` is evaluated against the cart subtotal *after* seller campaigns.
- **Single Redemption per Checkout (`CouponService.redeem`):**
  1. Acquires a PostgreSQL `PESSIMISTIC_WRITE` row lock via `findByCodeIgnoreCaseForUpdate`.
  2. Executes `CouponRedisLimiterService.acquireCouponUsage` (`apply_coupon_with_limit.lua`) and registers `releaseUsageUnlessCommitted` (`release_coupon_usage.lua`) via `TransactionSynchronization` so rolled-back checkouts restore quota immediately.
  3. Validates active window, audience, and DB usage counts, then writes one `CouponRedemption` row bound to the primary discounted order.
- **Documented Redis Fallback:** If Redis is unreachable, `acquireCouponUsage` returns `NOT_COUNTED` and PostgreSQL row lock + `coupon_redemptions` count checks enforce limits safely.

## Redis & Lua Scripts
- Keys (30-day TTL in `CouponRedisLimiterService`): `v4:coupon:usage:global:{CODE}` and `v4:coupon:usage:user:{CODE}:{userId}`.
- Lua scripts (`src/main/resources/scripts/`): `apply_coupon_with_limit.lua` (`-1` global limit, `-2` user limit) and `release_coupon_usage.lua`.

## API
- **User (`CouponController`, `/api/v1/coupons`):** `POST /preview` · `GET /active` · `GET /redemptions`.
- **Admin (`AdminCouponController`, `/api/v1/admin/coupons`, `ROLE_ADMIN`):** `GET /` · `POST /` · `PUT /{id}` · `GET /audience-stats?audience=`.
