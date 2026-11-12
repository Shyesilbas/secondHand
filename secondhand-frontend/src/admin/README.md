# Admin UI Module

Administrative coupon management, audience segmentation targeting, discount configuration, and platform-wide campaign governance.

---

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

---

## 2. Route Map & Entry Points

| Route | Guard / Access | Component | Purpose & Query Params |
|---|---|---|---|
| `/admin/coupons` | `AdminRoute` | `AdminCouponsPage` | Protected coupon operations table with creation dialog and audience stat inspection. |

---

## 3. Component Hierarchy & Core Sub-Components

```
admin/
├── pages/
│   └── AdminCouponsPage.jsx           # Main administrative coupon table and drawer
├── services/
│   └── adminCouponApi.js              # REST client for /v1/admin/coupons
└── README.md                          # Module architecture specification
```

### Component Roles & Invariants
- **`AdminRoute` Enforcement:** Unauthenticated users or members lacking `ROLE_ADMIN` permissions are redirected away immediately; unauthorized API calls trigger 403 Forbidden interceptors.
- **Atomic Cache Eviction:** Creating or updating a coupon invalidates `['admin', 'coupons']` and cascades to user-facing coupon query keys `['coupons']`.
- **Audience Estimation:** Selecting an audience segment queries `audienceStats(audience)` to preview the eligible recipient count before publishing.

---

## 4. State Management & React Query Contract

### Query Keys & Cache Matrix
| Query Key | Scope | Stale Time | Garbage Collection | Invalidation Triggers |
|---|---|---|---|---|
| `['admin', 'coupons']` | Platform-wide coupon directory | 1 min (`60000ms`) | 10 min (`600000ms`) | Coupon creation, update, or deactivation |
| `['admin', 'coupons', 'audience', segment]` | Estimated audience user counts | 5 min (`300000ms`) | 15 min (`900000ms`) | Changing target audience filter |

### Service Methods (`adminCouponApi.js`)
- `list()`: Fetches all platform coupons (`GET /v1/admin/coupons`).
- `create(body)`: Defines a new system coupon (`POST /v1/admin/coupons`).
- `update(id, body)`: Updates active state, validity dates, or usage limits (`PUT /v1/admin/coupons/{id}`).
- `audienceStats(audience)`: Retrieves recipient count estimate (`GET /v1/admin/coupons/audience-stats/{audience}`).

---

## 5. Form & Data Validation Rules

- **Coupon Code:** Alphanumeric uppercase string (3-30 characters, no spaces).
- **Discount Value:** Must be positive; percentage discounts capped at `100%`.
- **Usage Limits:** Optional `maxUsageCount` and `maxUsagePerUser` must be positive integers if provided.
- **Date Boundaries:** `startDate` must precede `endDate`.
- **Vertical Scoping:** Must select valid catalog vertical codes or `ALL`.

---

## 6. UX States, Backend Error Contract & Restrained Design Tokens

### 4-State UX Handling
1. **Loading State:** `AdminCouponsPage` renders a skeleton data table with column headers and striped skeleton rows.
2. **Empty State:** Clean empty table state with a button to `"Create First Coupon"`.
3. **Error State:** Surfaces inline alert banner with error message and retry action.
4. **Data State:** Dense administrative data table featuring code badges, discount pill indicators, validity dates, audience tags, and toggle switches.

### Backend Error Contract
- Handled through `useNotification` toasts.
- Known error codes:
  - `COUPON_CODE_EXISTS`: Prevented when attempting to create a duplicate promotional code.
  - `INVALID_COUPON_DATES`: Start date cannot be after expiry date.
  - `FORBIDDEN_ADMIN_ACCESS`: User lacks administrator privileges.

### Restrained Design Tokens
- **Table Density:** Compact administrative layout with `py-2.5 px-3` cell spacing and `border-border`.
- **Status Toggles:** Restrained switch toggles with clear accessible focus rings.
- **Audience Badges:** Subdued neutral pills (`bg-surface-alt text-muted-foreground border-border text-xs`).
- **Radii:** Standard `rounded-md` across modals and buttons.
