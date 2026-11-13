# Dashboard & Analytics UI Module

Comprehensive analytics dashboards for sellers and buyers featuring performance metrics, sales conversion funnels, delivery trackers, and Chart.js data visualizations.

> [!NOTE]
> **Backend Counterpart & Architecture Deep Dive:**
> - **Backend Module:** [`dashboard`](../../../src/main/java/com/serhat/secondhand/dashboard/README.md)
> - **Architecture Deep Dive:** [`docs/multi-tier-redis-caching-and-invalidation.md`](../../../docs/multi-tier-redis-caching-and-invalidation.md)

## 1. Overview & Purpose

The `dashboard` module delivers commercial intelligence and transaction analytics tailored to marketplace participants. It provides two distinct role-specific operational dashboards:
1. **Seller Commercial Command Center (`SellerDashboardPage`):** Real-time analytics tracking gross merchandise value, orders completed, conversion funnels (views to purchases), category breakdowns, customer rating distributions, and top-selling listing tables.
2. **Buyer Purchasing Portal (`BuyerDashboardPage`):** Personal purchase insights tracking total expenditure, active courier and meetup deliveries (`ActiveDeliveriesTracker`), monitored price drop alerts (`PriceDropWatchlist`), and negotiation savings metrics (`OfferAnalyticsCard`).
3. **Dynamic Time-Series Filtering:** Standardized range selector (`TimeRangeSelector`) supporting `7D`, `30D`, `90D`, and `1Y` analytical windows.
4. **Restrained Data Visualizations:** High-contrast, theme-synchronized graphs powered by `chart.js` and `react-chartjs-2`.

## 2. Route Map & Entry Points

| Path | Page | Access |
|---|---|---|
| `/dashboard/buyer` | `BuyerDashboardPage` | Protected |
| `/dashboard/seller` | `SellerDashboardPage` | Protected |

## 3. Component Rules

- **Time Range Cache Isolation:** Switching between `7D`, `30D`, `90D`, and `1Y` uses isolated query keys (`['dashboard', role, timeRange]`), preventing stale cache collisions.
- **Chart Memory Safety:** Canvas instances and Chart.js subscribers are automatically unregistered on unmount to prevent browser memory leaks.
- **Authentication Guard:** Both dashboard routes require active user sessions; unauthorized requests redirect to `/login`.

---

## 4. React Query Keys

Generated from code; the hook files are the source of truth.

| Query key | Defined in |
|---|---|
| `DASHBOARD_KEYS.buyer(user?.id, startDate, endDate)` | `useDashboard.js` |
| `DASHBOARD_KEYS.seller(user?.id, startDate, endDate)` | `useDashboard.js` |

## 5. Form & Data Validation Rules

- **Time Range Presets:** `TimeRangeSelector` offers 7, 30, 90, 180 and 365 days and sends `startDate` / `endDate` (part of `DASHBOARD_KEYS`).
- **Currency & Metric Formatting:** Monetary amounts format through currency formatters with standardized Turkish Lira (`TRY`) symbols.
