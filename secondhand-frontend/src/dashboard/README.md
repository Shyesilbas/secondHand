# Dashboard & Analytics UI Module

Comprehensive analytics dashboards for sellers and buyers featuring performance metrics, sales conversion funnels, delivery trackers, and Chart.js data visualizations.

---

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

---

## 2. Route Map & Entry Points

| Route | Guard / Access | Component | Purpose & Query Params |
|---|---|---|---|
| `/dashboard/seller` (or `/dashboard`) | `ProtectedRoute` | `SellerDashboardPage` | Commercial operations dashboard for sellers; supports `timeRange` query parameter. |
| `/dashboard/buyer` | `ProtectedRoute` | `BuyerDashboardPage` | Purchase analytics, package deliveries, and savings tracker for buyers. |

---

## 3. Component Hierarchy & Core Sub-Components

```
dashboard/
├── pages/
│   ├── SellerDashboardPage.jsx        # Commercial command center layout
│   └── BuyerDashboardPage.jsx         # Buyer purchasing and delivery overview
├── components/
│   ├── TimeRangeSelector.jsx          # Pill selector for 7D, 30D, 90D, 1Y windows
│   ├── MetricCard.jsx                 # KPI summary card with percentage delta indicator
│   ├── RevenueChart.jsx               # Line / area time-series revenue chart
│   ├── ConversionFunnel.jsx           # Views -> Favorites -> Offers -> Sales funnel
│   ├── OrderStatusBreakdown.jsx       # Order fulfillment distribution bar chart
│   ├── CategoryBreakdown.jsx          # Sales distribution across catalog verticals
│   ├── RatingDistribution.jsx         # Customer satisfaction star distribution
│   ├── TopListingsTable.jsx           # Performance table of best-selling products
│   ├── ActiveDeliveriesTracker.jsx    # Real-time shipment status card for buyers
│   ├── PriceDropWatchlist.jsx         # Monitored listing discounts list
│   ├── OfferAnalyticsCard.jsx         # Negotiation success rate and savings summary
│   └── DashboardUi.jsx                # Grid container and card layout primitives
├── hooks/
│   └── useDashboard.js                # React Query hook parameterizing dashboard metrics
├── services/
│   └── dashboardService.js            # REST client for /v1/dashboards endpoints
├── dashboardConstants.js              # Time range definitions and default metric formats
└── README.md                          # Module architecture specification
```

### Component Roles & Invariants
- **Time Range Cache Isolation:** Switching between `7D`, `30D`, `90D`, and `1Y` uses isolated query keys (`['dashboard', role, timeRange]`), preventing stale cache collisions.
- **Chart Memory Safety:** Canvas instances and Chart.js subscribers are automatically unregistered on unmount to prevent browser memory leaks.
- **Authentication Guard:** Both dashboard routes require active user sessions; unauthorized requests redirect to `/login`.

---

## 4. State Management & React Query Contract

### Query Keys & Cache Matrix
| Query Key | Scope | Stale Time | Garbage Collection | Invalidation Triggers |
|---|---|---|---|---|
| `['dashboard', 'seller', timeRange]` | Seller metrics, revenue, and funnels | 2 min (`120000ms`) | 10 min (`600000ms`) | Order completion or refund event |
| `['dashboard', 'buyer', timeRange]` | Buyer spending, deliveries, and savings | 2 min (`120000ms`) | 10 min (`600000ms`) | Order placement or package delivery |

### Hooks Contract
- `useDashboard(role, timeRange)`: Returns `{ data, isLoading, error, refetch }` fetching data from `/v1/dashboards/seller` or `/v1/dashboards/buyer`.

---

## 5. Form & Data Validation Rules

- **Time Range Enum:** Strictly validated against `DASHBOARD_TIME_RANGES`: `'7D'`, `'30D'`, `'90D'`, `'1Y'`. Invalid values fallback to `'30D'`.
- **Currency & Metric Formatting:** Monetary amounts format through currency formatters with standardized Turkish Lira (`TRY`) symbols.

---

## 6. UX States, Backend Error Contract & Restrained Design Tokens

### 4-State UX Handling
1. **Loading State:** Displays a full-page grid of skeleton metric cards, an animated placeholder canvas for the revenue chart, and skeleton table rows.
2. **Empty State:** For new sellers with no transactions, displays onboarding guidance prompting them to publish their first listing.
3. **Error State:** Surfaces inline alert banner with a retry button if analytics services fail to respond.
4. **Data State:** Rich operational layout with KPI cards, line charts, conversion funnel steps, and tabular listing breakdowns.

### Backend Error Contract
- Handled through `useNotification` toasts.
- Known error codes:
  - `DASHBOARD_DATA_UNAVAILABLE`: Returned during overnight batch re-indexing.
  - `UNAUTHORIZED_ACCESS`: Returned if user session expires.

### Restrained Design Tokens
- **Chart Palette:** Single-hue primary gradients (`primary` with 20% opacity fill) and neutral grid lines (`border-border`), strictly avoiding distracting multi-color rainbow palettes.
- **Metric Badges:** Positive deltas use subdued green (`text-emerald-600 dark:text-emerald-400`); negative deltas use subdued red (`text-rose-600 dark:text-rose-400`).
- **Radii:** Standard `rounded-md` across all cards, chart canvases, and table containers.
