# Dashboard & Analytics UI Module

Comprehensive analytics dashboards for sellers and buyers featuring performance metrics, sales funnels, and data visualizations.

## Architecture

- **`SellerDashboardPage`:** Commercial command center for sellers. Renders KPI summary cards (`MetricCard`), time-series sales graphs (`RevenueChart`), conversion funnels (`ConversionFunnel`), category breakdown (`CategoryBreakdown`), order fulfillment stats (`OrderStatusBreakdown`), customer ratings (`RatingDistribution`), and top-performing listings (`TopListingsTable`).
- **`BuyerDashboardPage`:** Purchasing insights portal for buyers. Tracks total spend, active deliveries (`ActiveDeliveriesTracker`), watched price drops (`PriceDropWatchlist`), and negotiation history (`OfferAnalyticsCard`).
- **`useDashboard`:** Core hook fetching seller or buyer dashboard payloads via `dashboardService` (`/v1/dashboards/seller` and `/v1/dashboards/buyer`) parameterized by selected `timeRange` (`7D`, `30D`, `90D`, `1Y`).
- **Chart Visualizations:**
  - Integrated via `chart.js` and `react-chartjs-2`.
  - Configured with non-invasive palettes, subtle grid lines, and responsive layouts matching the application theme.

## Invariants

- **Time Range Isolation:** Switching time ranges updates query keys (`['dashboard', role, timeRange]`), ensuring distinct caches per analysis period.
- **Role Guarding:** `SellerDashboardPage` and `BuyerDashboardPage` are mounted behind `ProtectedRoute`; unauthorized access redirects to `/login`.
- **Chart Destruction Safety:** Chart canvas instances are properly cleaned up across renders and unmounts to prevent memory leaks.
- **Restrained Styling:** Strict adherence to `.agents/skills/restrained-ui-design-standard/SKILL.md`: muted accent colors on charts, no rainbow graphs, clear numerical tabular data, and zero emojis.

