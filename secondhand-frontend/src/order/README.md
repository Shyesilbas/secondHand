# Order UI Module

## Purpose
The `order` UI module manages the display of seller and buyer orders, handling complex state interactions such as order searches, pagination, modal actions, and status presentation.

## Architecture Overview
- **useOrderFlow:** Handles list fetching, mode switching (buyer/seller), and search state coordination.
- **useOrderDetailActions:** Encapsulates the mutation logic executed inside modals (e.g. canceling, saving notes, completing delivery).
- **statusPresentation.js:** Acts as the single source of truth for rendering status colors, badges, and textual representations.

## Business Invariants & Constraints
- **State Cleanup:** Clearing an active order search must guarantee the cleanup of the search result state.
- **Race Condition Prevention:** Modal request fetching utilizes a `requestRef` to ensure late-arriving responses from old requests do not overwrite the current view state.
- **Cache Integrity:** Refreshing an order list should invalidate existing React Query cache keys rather than sending duplicate standalone fetch requests.

## Integration Points
- **Incoming:** Renders within the `MyOrdersPage` and `ISoldPage` components.
- **Outgoing:** Calls the backend `order` domain APIs via `orderService.js`.

## Related Knowledge
- **Modify Order UI**
  -> `.docs/runbooks/modify-order-ui.md`
