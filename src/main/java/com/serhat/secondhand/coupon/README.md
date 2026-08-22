# Coupon Domain

## Purpose
The `coupon` domain manages platform discounts, promotional campaigns, and user redemption rules.

## Architecture & Concurrency Control
- **Atomic Redis Limiter:** High-concurrency coupon redemptions (e.g. Flash sales, first 100 users) are validated via `apply_coupon_with_limit.lua` executed in Redis before touching PostgreSQL.
- **Global & User Limits:** Protects against race condition over-usage when hundreds of users redeem simultaneously.
- **Transactional Persistence:** Once verified via Redis and domain rules, redemptions are committed to `coupon_redemptions`.

## Script:
- `scripts/apply_coupon_with_limit.lua`
