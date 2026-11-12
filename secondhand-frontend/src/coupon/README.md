# Coupon UI Module

> [!NOTE]
> **Backend Counterpart & Architecture Deep Dive:**
> - **Backend Module:** [`coupon`](../../../src/main/java/com/serhat/secondhand/coupon/README.md)
> - **Architecture Deep Dive:** [`docs/pricing-coupon-and-campaign-architecture.md`](../../../docs/pricing-coupon-and-campaign-architecture.md)

## 1. Executive Summary & Route Map
The `coupon` module provides customer-facing discovery, redemption tracking, and validation formatting for platform-wide and seller promotional discount vouchers.

### Route Map
| Route Path | Component | Access | Lazy Loaded | Purpose |
|---|---|---|---|---|
| `/coupons` | `PlatformCouponsPage` | `Protected` | Yes | Tabbed browser for active available coupons and redeemed history |

---

## 2. Component Hierarchy & File Structure

```
src/coupon/
├── pages/
│   └── PlatformCouponsPage.jsx         # Tabbed coupon hub (Active vs. Participated)
├── utils/
│   └── couponUiFormat.js               # Formats 6 CouponDiscountKind labels and badge values
└── README.md                           # Module documentation
```

---

## 3. React Query 5 Data Flow & Query Key Invalidation Matrix

### Query Key Topology
- `['coupons', 'active-for-me']`: Retrieves active coupons eligible for the authenticated user (`couponService.active()`).
- `['coupons', 'participated']`: Retrieves user's historical redemptions (`couponService.participated()`).
- `['activeCoupons']`: Platform-wide active coupon catalog displayed inside checkout modals.

### Invalidation Matrix
| Trigger / Mutation | Invalidated Query Keys | UX Impact |
|---|---|---|
| `handleCheckout` (order completed) | `['coupons', 'active-for-me']`, `['coupons', 'participated']` | Moves redeemed single-use coupon to Participated tab |
| Cart coupon removal | `['cartItems']` | Restores coupon to available status |

---

## 4. 4-State UX Handling Discipline

1. **Loading State:**
   - `PlatformCouponsPage` renders `<SkeletonList count={4} />` mimicking coupon ticket cards.
2. **Empty State:**
   - Active Tab Empty: Renders `<EmptyState>` with a ticket icon: "No active discount coupons available right now."
   - Participated Tab Empty: "You haven't used any promotional coupons yet."
3. **Error State:**
   - Inline `<Alert variant="error">` banners if coupon endpoints fail to load.
4. **Disabled / Submitting State:**
   - Copy-to-clipboard button transitions to a checkmark state (`Check` icon) for 2 seconds.

---

## 5. Coupon Formats & Kind Representation

Supported discount kinds defined in `couponUiFormat.js` (matching backend `CouponDiscountKind`):
- `ORDER_PERCENT`: Percentage off total order.
- `ORDER_FIXED`: Fixed TRY amount off total order.
- `TYPE_PERCENT`: Percentage off specific listing categories.
- `TYPE_FIXED`: Fixed TRY amount off specific categories.
- `THRESHOLD_FIXED`: Fixed discount upon reaching cart threshold (e.g. 100 TL off over 1,000 TL).
- `THRESHOLD_PERCENT`: Percentage discount upon reaching cart threshold.

---

## 6. Backend Contract & Safe Error Handling
- Invalid coupon errors during entry are mapped via `errorUtils.getErrorMessage(err)`:
  - `COUPON_NOT_FOUND` -> "Invalid coupon code."
  - `COUPON_MIN_ORDER_AMOUNT_NOT_MET` -> "Cart total does not meet the minimum threshold for this coupon."
  - `COUPON_ALREADY_USED` -> "You have already redeemed this single-use coupon."

---

## 7. Restrained Design Tokens & Anti-Patterns
- **Typography:** Codes displayed in `font-mono tracking-wider font-semibold`.
- **Zero Emojis:** Strictly prohibited across coupon cards, copy buttons, and status tags.
- **Radius Ceiling:** Coupon ticket containers and copy buttons strictly use `rounded-md`.
