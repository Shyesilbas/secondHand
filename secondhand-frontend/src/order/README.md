# Order UI Module

Buyer/seller order lists, search, modal actions and status presentation. Used by `MyOrdersPage` and `ISoldPage`; calls the backend through `orderService.js`.

## Architecture
- `useOrderFlow`: list query, buyer/seller mode, tabs, filters and modal state; composes `useOrderSearch` (order-number input driven by the `q` URL param) and `useOrderItemReviews` (reviews keyed by order-item id, shared with `OrderDetailsModal`).
- Tabs: `ORDER_LIST_TABS` + `getOrderTabStatuses(tab, viewMode)` in `constants/orderUiConstants.js` map each tab to backend statuses. The list sends them as `statuses`, so filtering happens on the server across all pages. Tab badges come from the `status-counts` endpoints. The "Aksiyon bekleyen" tab differs per role (buyer: delivered/handover/meetup, seller: confirmed/processing/meetup).
- `components/shared/OrdersListLayout.jsx`: shared Aldıklarım/Sattıklarım screen (route switch, seller summary, tabs, rows). Each row shows at most one next-step action from `getRowAction`; order renaming lives in `OrderDetailsModal`.
- `useOrderDetailActions`: modal mutations (cancel, notes, complete delivery).
- `utils/statusPresentation.js`: single source for status colors/badges. Adding a status means updating `getOrderStatusDotClass` and `getOrderStatusTextClass` together; never hardcode status colors in components.

## Invariants
- The search is an exact `orderNumber` filter on the same list endpoint; while it is active the tab filter is ignored. Clearing it removes the `q` param.
- `OrderDetailsModal` loads its own detail (`useOrderDetails`); the flow only holds the clicked row.
- After an action, invalidate the `ORDER_QUERY_KEYS` queries instead of issuing standalone fetches; buyer list, status counts, detail and item reviews sit under `ORDER_QUERY_KEYS.orders`; seller list and counts sit under `ORDER_QUERY_KEYS.sellerOrders`.
- Seller ship deadline: cargo orders in `CONFIRMED`/`PROCESSING` must ship within `ORDER_TIME.SHIP_DEADLINE_MS` (72h from `createdAt`, mirrors backend `SHIP_DEADLINE_HOURS`) or the backend cancels them. The I_SOLD page shows the rule and each card a minute-ticking countdown; the header Package button shows `!` via `useSellerToShipCount` (shares the `sellerStatusCounts(userId, 'ALL')` cache key).
