# Dashboard Domain

## Purpose
The `dashboard` domain provides aggregated operational analytics, sales funnel performance, buyer insights, and delivery tracking metrics for both sellers and buyers using Hexagonal Architecture (Ports & Adapters).

## Architecture Overview
- **Hexagonal Decoupling:** Instead of depending directly on external domain entities, `DashboardService` defines outbound ports for required statistics and queries.
- **Outbound Ports & Adapters:**
  - `SalesStatisticsPort` -> `SalesStatisticsAdapter` (aggregates completed sales and revenue from `order` domain).
  - `ListingStatisticsPort` -> `ListingStatisticsAdapter` (counts active, draft, and sold listings).
  - `ListingViewStatisticsPort` -> `ListingViewStatisticsAdapter` (aggregates daily breakdown of listing views).
  - `FavoriteStatisticsPort` -> `FavoriteStatisticsAdapter` (measures user interest and price drop alerts).
  - `OfferStatisticsPort` -> `OfferStatisticsAdapter` (computes offer acceptance, counter-offer ratios, and funnel stages).
  - `ReviewStatisticsPort` -> `ReviewStatisticsAdapter` (seller rating averages and recent reviews).
  - `UserQueryPort` -> `UserQueryAdapter` (basic user profile and registration metadata).

## Business Invariants & Constraints
- **Zero Cross-Domain Mutation:** The dashboard domain is strictly read-only; it computes and aggregates metrics without altering any order, payment, or listing state.
- **Date Range Bounding:** Analytics intervals (`DateRangeHelper`) validate time windows to prevent unbounded full-table scans.
- **Seller/Buyer Isolation:** Buyers can only query their own outgoing offers, active deliveries, and saved items; sellers only access metrics for listings they own.

## Public APIs
- `GET /api/v1/dashboard/seller`: Aggregated revenue, active listings, offer conversion funnel, and review metrics.
- `GET /api/v1/dashboard/buyer`: Active incoming deliveries, pending offers, price drop alerts on favorites, and total savings.
