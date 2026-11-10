# Admin UI Module

Administrative coupon management, audience targeting, discount configurations, and campaign oversight.

## Architecture

- **`AdminCouponsPage`:** Protected administrative page (`/admin/coupons`) mounted behind `AdminRoute`. Allows administrators to list, inspect, create, and update platform-wide coupon rules.
- **`adminCouponApi`:** API adapter communicating with `/v1/admin/coupons` endpoints:
  - `list()`: Retrieves all system coupons (`GET /v1/admin/coupons`).
  - `create(body)`: Defines a new platform coupon (`POST /v1/admin/coupons`).
  - `update(id, body)`: Updates active status, validity period, or limits (`PUT /v1/admin/coupons/{id}`).
  - `audienceStats(audience)`: Fetches estimated eligible user count (`GET /v1/admin/coupons/audience-stats/{audience}`).
- **Audience Targeting Options:**
  - `ALL_USERS`: Global applicability across all registered accounts.
  - `USER_ID_LIST`: Whitelisted explicit user ID array.
  - `NEVER_ORDERED_FIRST_ORDER`: First-purchase incentive targeting users with zero prior completed orders.
- **Supported Discount Kinds:**
  - `ORDER_PERCENT`, `ORDER_FIXED`, `TYPE_PERCENT`, `TYPE_FIXED`, `THRESHOLD_FIXED`, `THRESHOLD_PERCENT`.
- **Vertical Scoping:**
  - Discounts can be globally scoped or restricted to specific catalog verticals (`VEHICLE`, `ELECTRONICS`, `REAL_ESTATE`, `CLOTHING`, `BOOKS`, `SPORTS`, `OTHER`).

## Invariants

- **Administrative Authorization:** Access is strictly gated by `AdminRoute`; non-admin sessions redirect to `/login` or home.
- **Atomic Cache Eviction:** Creating or updating a coupon invalidates `['admin', 'coupons']` and cascades to user-facing coupon query keys `['coupons']`.
- **Restrained Styling:** Strict compliance with `.agents/skills/restrained-ui-design-standard/SKILL.md`: clear tabular summaries, muted status badges, hairline dividers, and zero emojis.

