# Admin UI Module

Administrative coupon management, audience segmentation targeting, discount configuration, and platform-wide campaign governance.

> [!NOTE]
> **Backend Counterpart & Architecture Deep Dive:**
> - **Backend Module:** [`coupon`](../../../src/main/java/com/serhat/secondhand/coupon/README.md)
> - **Architecture Deep Dive:** [`docs/pricing-coupon-and-campaign-architecture.md`](../../../docs/pricing-coupon-and-campaign-architecture.md)

## 1. Overview & Purpose

The `admin` module provides administrative oversight and promotional configuration tools for platform operators. The current primary capability centers on coupon lifecycle management:
1. **Administrative Coupon Dashboard:** Central operations view (`AdminCouponsPage`) mounted behind `AdminRoute` to inspect, create, and modify platform coupon codes.
2. **Audience Targeting Rules:** Audience segmentations including global availability (`ALL_USERS`), whitelist targeting (`USER_ID_LIST`), and first-time buyer acquisition incentives (`NEVER_ORDERED_FIRST_ORDER`).
3. **Multi-Model Discount Engine:** Supports fixed amounts, percentage deductions, and basket threshold requirements.
4. **Vertical Scoping:** Rules can be scoped globally or restricted to specific catalog verticals (`VEHICLE`, `ELECTRONICS`, `REAL_ESTATE`, `CLOTHING`, `BOOKS`, `SPORTS`, `OTHER`).

## 2. Route Map & Entry Points

| Path | Page | Access |
|---|---|---|
| `/admin/coupons` | `AdminCouponsPage` | Admin |

| Embedded entry | Where |
|---|---|

## 3. Component Rules

- **`AdminRoute` Enforcement:** Unauthenticated users or unauthenticated users go to `/login`, non-admin users to `/` (`isAdminUser` in `AdminRoute.jsx`).
- **Atomic Cache Eviction:** Creating or updating a coupon invalidates `['admin', 'coupons']` and cascades to user-facing coupon query keys `['coupons']`.
- **Audience Estimation:** Selecting an audience segment queries `audienceStats(audience)` to preview the eligible recipient count before publishing.

---

## 4. React Query Keys

Generated from code; the hook files are the source of truth.

| Query key | Defined in |
|---|---|
| `['admin', 'coupons', 'audience-stats', form.audience]` | `AdminCouponsPage.jsx` |
| `['admin', 'coupons']` | `AdminCouponsPage.jsx` |

| Invalidated / updated key | By |
|---|---|
| `['admin', 'coupons', 'audience-stats']` | `AdminCouponsPage.jsx` |
| `['admin', 'coupons']` | `AdminCouponsPage.jsx` |

## 5. State Management

### Service Methods (`adminCouponApi.js`)
- `list()`: Fetches all platform coupons (`GET /v1/admin/coupons`).
- `create(body)`: Defines a new system coupon (`POST /v1/admin/coupons`).
- `update(id, body)`: Updates active state, validity dates, or usage limits (`PUT /v1/admin/coupons/{id}`).
- `audienceStats(audience)`: Retrieves recipient count estimate (`GET /v1/admin/coupons/audience-stats/{audience}`).

## 6. Form & Data Validation Rules

- **Coupon Code:** Alphanumeric uppercase string (3-30 characters, no spaces).
- **Discount Value:** Must be positive; percentage discounts capped at `100%`.
- **Usage Limits:** Optional `usageLimitGlobal` and `usageLimitPerUser` must be positive integers if provided.
- **Date Boundaries:** `startDate` must precede `endDate`.
- **Vertical Scoping:** Must select valid catalog vertical codes or `ALL`.
