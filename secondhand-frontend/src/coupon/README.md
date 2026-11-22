# Coupon UI Module

> [!NOTE]
> **Backend Counterpart & Architecture Deep Dive:**
> - **Backend Module:** [`coupon`](../../../src/main/java/com/serhat/secondhand/coupon/README.md)
> - **Architecture Deep Dive:** [`docs/pricing-coupon-and-campaign-architecture.md`](../../../docs/pricing-coupon-and-campaign-architecture.md)

## 1. Executive Summary & Route Map

| Path | Page | Access |
|---|---|---|
| `/coupons` | `PlatformCouponsPage` | Protected |

## 2. React Query Keys

Generated from code; the hook files are the source of truth.

| Query key | Defined in |
|---|---|
| `['coupons', 'active-for-me']` | `PlatformCouponsPage.jsx` |
| `['coupons', 'redemptions']` | `PlatformCouponsPage.jsx` |

## 3. Coupon Formats & Kind Representation

Supported discount kinds defined in `couponUiFormat.js` (matching backend `CouponDiscountKind`):
- `ORDER_PERCENT`: Percentage off total order.
- `ORDER_FIXED`: Fixed TRY amount off total order.
- `TYPE_PERCENT`: Percentage off specific listing categories.
- `TYPE_FIXED`: Fixed TRY amount off specific categories.
- `THRESHOLD_FIXED`: Fixed discount upon reaching cart threshold (e.g. 100 TL off over 1,000 TL).
- `THRESHOLD_PERCENT`: Percentage discount upon reaching cart threshold.

## 4. Page Behavior (`PlatformCouponsPage`)

- **Usable tab:** one card per coupon from `GET /coupons/active` with discount, code, title, description, the user's remaining uses (`usageRemainingPerUser` / `usageLimitPerUser`, shown only when a limit exists) and the end date. A coupon stays listed while any use remains; the backend drops it only when the per-user or global quota is exhausted.
- **Used tab:** one row per redemption from `GET /coupons/redemptions`, including the snapshotted `discountAmount` and the order link.
- **Total savings line:** sum of `discountAmount` over the redemptions; the backend snapshot is the source of truth, nothing is recomputed in the UI.
