# Modify Order UI

## Purpose
Execution steps for modifying order listing behaviors, adding new modal actions (e.g., cancellations, notes), or changing status color mappings in the UI.

## When to Load
- When fixing issues where the order list does not update after an action.
- When search results behave inconsistently in the order page.
- When changing the color or text of an order status badge.

## When NOT to Load
- When modifying backend orchestration logic (`checkout` or `order` backend domain).

## Assumptions
- `statusPresentation.js` is the single source of truth for UI badges/colors.
- Hooks maintain separation between list retrieval (`useOrderFlow`) and modal interactions (`useOrderDetailActions`).

## Procedure
1. If the list is not updating after an action, verify the query invalidation keys (`ORDER_QUERY_KEYS`) match between the mutation and the fetch query in `useOrdersListQuery.refresh`.
2. For inconsistent searches, ensure that the search state (`searchResult`, `isSearchMode`) is properly cleaned up when the user clears the input or submits empty values.
3. If a modal shows the wrong order, check that `orderDetailRequestRef` correctly binds the request ID to the fetch function to prevent race conditions during rapid clicks.
4. When adding a new status badge, update `getOrderStatusBadgeClass`, `getOrderStatusTextClass`, and `getOrderStatusIndicatorClass` together.

## Pitfalls
- Hardcoding colors inside React components instead of using `statusPresentation.js`.
- Implementing duplicate fetch requests instead of invalidating the React Query cache.

## Related Files
- `src/order/hooks/useOrderFlow.js`
- `src/order/utils/statusPresentation.js`
