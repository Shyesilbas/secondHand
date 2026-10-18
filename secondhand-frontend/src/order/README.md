# Order UI Module

Buyer/seller order lists, search, modal actions and status presentation. Used by `MyOrdersPage` and `ISoldPage`; calls the backend through `orderService.js`.

## Architecture
- `useOrderFlow`: list query, buyer/seller mode, filters and modal state; composes `useOrderSearch` (order-number search driven by the `q` URL param) and `useOrderItemReviews` (reviews keyed by order-item id, shared with `OrderDetailsModal`).
- `useOrderDetailActions`: modal mutations (cancel, notes, complete delivery).
- `utils/statusPresentation.js`: single source for status colors/badges. Adding a status means updating `getOrderStatusDotClass` and `getOrderStatusTextClass` together; never hardcode status colors in components.

## Invariants
- Clearing the search removes the `q` param; search result and error are derived from that query.
- `OrderDetailsModal` loads its own detail (`useOrderDetails`); the flow only holds the clicked row.
- After an action, invalidate the `ORDER_QUERY_KEYS` queries instead of issuing standalone fetches; list, detail, search and item reviews all sit under `ORDER_QUERY_KEYS.orders`.
