# Dashboard Domain

Provides read-only seller and buyer analytics (`SellerDashboardDto`, `BuyerDashboardDto`) using hexagonal outbound ports, parallel `CompletableFuture` aggregation on `taskExecutor`, and date-bounded Redis caching.

> [!NOTE]
> **Related Documentation & Runbooks:**
> - **Architecture Deep Dive:** [`docs/multi-tier-redis-caching-and-invalidation.md`](/docs/multi-tier-redis-caching-and-invalidation.md)
> - **Frontend Module:** [`secondhand-frontend/src/dashboard/README.md`](/secondhand-frontend/src/dashboard/README.md)
> - **Key Entry Points:** [`DashboardController`](api/DashboardController.java) · [`DashboardService`](application/DashboardService.java) · [`IDashboardService`](application/IDashboardService.java) · [`DashboardMapper`](mapper/DashboardMapper.java) · [`DateRangeHelper`](util/DateRangeHelper.java)

## Business Rules & Invariants
- **Hexagonal Outbound Port Decoupling:** `DashboardService` never queries external repositories directly; it aggregates metrics through outbound ports (`SalesStatisticsPort` -> `order`, `ListingStatisticsPort` & `ListingViewStatisticsPort` -> `listing`, `FavoriteStatisticsPort` -> `favorite`, `OfferStatisticsPort` -> `offer`, `ReviewStatisticsPort` -> `review`, `UserQueryPort` -> `user`).
- **Parallel Non-Blocking Assembly:** `DashboardService` runs current/prior period revenue, daily trends, listing counts, views, favorites, offer funnel, and review stats concurrently via `CompletableFuture.allOf(...)` on `taskExecutor`.
- **Bounded Date Ranges & Read-Only Guarantee (`DateRangeHelper`):** Omitted `endDate` defaults to `now()` and `startDate` to 30 days prior, preventing unbounded scans. Dashboard endpoints never mutate state.

## Redis & Caching
- Spring caches (`CacheConfig`): `dashboard:seller` (`#sellerId + ':' + #startDate.toLocalDate() + ':' + #endDate.toLocalDate()`) and `dashboard:buyer` (`#buyerId + ':' + #startDate.toLocalDate() + ':' + #endDate.toLocalDate()`).

## API (`DashboardController`, `/api/v1/dashboards`)
- `GET /seller?startDate=&endDate=` — seller revenue, period growth, listing/view/favorite/offer funnel, and review analytics (`SellerDashboardDto`).
- `GET /buyer?startDate=&endDate=` — buyer active deliveries, pending offers, and favorite price-drop summary (`BuyerDashboardDto`).
