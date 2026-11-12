# Order UI Module

> [!NOTE]
> **Backend Counterpart & Architecture Deep Dive:**
> - **Backend Module:** [`order`](../../../src/main/java/com/serhat/secondhand/order/README.md)
> - **Architecture Deep Dive:** [`docs/order-lifecycle-and-compensation-management.md`](../../../docs/order-lifecycle-and-compensation-management.md)
> - **Architecture Deep Dive:** [`docs/safe-meetup-delivery-and-verification.md`](../../../docs/safe-meetup-delivery-and-verification.md)

## 1. Executive Summary & Route Map
The `order` module manages the full post-purchase lifecycle for both buyers and sellers. It coordinates multi-seller split orders, cargo tracking, Safe Meetup QR/OTP handovers, item-level cancellations/refunds, and buyer review hooks.

### Route Map
| Route Path | Component | Access | Lazy Loaded | Purpose |
|---|---|---|---|---|
| `/orders` | `MyOrdersPage` | `Protected` | Yes | Buyer order history, delivery tracking, review actions |
| `/profile/i-sold` | `ISoldPage` | `Protected` | Yes | Seller order management, shipment dispatch, meetup handover |
| `/order/success` | `OrderSuccessPage` | `Protected` | Yes | Post-checkout landing confirmation for split orders |
| `/orders/:id/shipment` | `OrderShipmentPage` | `Protected` | Yes | Dedicated carrier tracking and delivery status view |

---

## 2. Component Hierarchy & File Structure

```
src/order/
├── pages/
│   ├── MyOrdersPage.jsx                # Buyer order ledger with status filters and search
│   ├── ISoldPage.jsx                   # Seller sales pipeline with "To Ship" badge
│   ├── OrderSuccessPage.jsx            # Order confirmation cards with shipping address
│   └── OrderShipmentPage.jsx           # Real-time logistics progress tracker
├── components/
│   ├── OrderDetailsModal.jsx           # Comprehensive modal drawer displaying full order details
│   ├── OrderSuccessModal.jsx           # Immediate post-payment confirmation popup
│   ├── CancelRefundModal.jsx           # Dialog capturing item cancellation or refund reasons
│   ├── shared/
│   │   └── OrdersListLayout.jsx        # Shared layout wrapping tabs, filters, and paginated orders
│   └── orderDetails/
│       ├── OrderStepper.jsx            # Step indicator (Created -> Processing -> Shipped -> Delivered -> Completed)
│       ├── OrderItemsSection.jsx       # Line items list with quantity, price, and review triggers
│       ├── ShippingDetailsSection.jsx  # Carrier name, tracking code, and tracking link
│       ├── MeetupHandoverSection.jsx   # Safe Meetup 6-digit OTP entry and QR scanner for handover
│       ├── ShipOrderForm.jsx           # Seller form selecting carrier provider and submitting dispatch
│       ├── OrderPaymentSummary.jsx     # Financial recap (subtotal, shipping, coupon, total paid)
│       └── OrderDetailsSkeleton.jsx     # Loading skeleton for order drawer
├── hooks/
│   ├── useOrderFlow.js                 # Buyer order listing query and status filtering
│   ├── useOrderDetails.js              # Detailed single-order fetcher
│   ├── useOrderDetailActions.js        # Cancellation, refund, and shipping mutation actions
│   ├── useSellerToShipCount.js         # Unshipped orders counter for seller navigation badges
│   ├── useOrderSearch.js               # Debounced search across order numbers and listing titles
│   └── useOrderItemReviews.js          # Syncs review submission status per order item
├── services/
│   └── orderService.js                 # Raw Axios endpoints (/api/v1/orders/**)
├── utils/
│   └── statusPresentation.js           # Formats order statuses and delivery badge colors
├── constants/
│   └── orderUiConstants.js             # Order filter tabs, delivery methods, status styles
└── orderConstants.js                   # Step definitions and default pagination sizes
```

---

## 3. React Query 5 Data Flow & Query Key Invalidation Matrix

### Query Key Topology
- `['orders', 'my', { page, size, status, search }]`: Paginated buyer orders.
- `['orders', 'sold', { page, size, status, search }]`: Paginated seller orders.
- `['orders', 'detail', orderId]`: Single order details with item breakdown.
- `['sellerToShipCount']`: Count of pending orders requiring seller shipment.

### Invalidation Matrix
| Mutation Hook | Endpoint | Invalidated Query Keys | UX Impact |
|---|---|---|---|
| `shipOrder` | `PUT /api/v1/orders/{id}/ship` | `['orders', 'sold']`, `['orders', 'detail', id]`, `['sellerToShipCount']` | Transitions order to `SHIPPED` and decrements badge |
| `cancelOrderItem` | `POST /api/v1/orders/{id}/items/{itemId}/cancel` | `['orders', 'my']`, `['orders', 'sold']`, `['orders', 'detail', id]` | Updates item status to `CANCELLED` and initiates refund |
| `requestRefund` | `POST /api/v1/orders/{id}/items/{itemId}/refund` | `['orders', 'my']`, `['orders', 'detail', id]` | Flags item for return review |
| `confirmHandover` | `POST /api/v1/orders/{id}/handover` | `['orders', 'my']`, `['orders', 'sold']`, `['orders', 'detail', id]` | Verifies Safe Meetup OTP and marks order delivered |

---

## 4. 4-State UX Handling Discipline

1. **Loading State:**
   - Orders list renders `<OrderDetailsSkeleton />` blocks replicating the order card layout.
   - Detail drawer shows skeleton bars across the stepper and item cards.
2. **Empty State:**
   - In `MyOrdersPage`, if no orders exist, renders `<EmptyState>` with a package icon: "You have not placed any orders yet."
   - In `ISoldPage`, if no sales exist: "No items sold yet. Boost visibility using Showcases."
3. **Error State:**
   - Displays `<Alert variant="error">` banners inside `CancelRefundModal` or `ShipOrderForm` using `errorUtils.getErrorMessage(err)`.
4. **Disabled / Submitting State:**
   - "Ship Order" and "Confirm Delivery" buttons enter a loading state during ongoing mutations.
   - Item cancellation buttons are disabled if the 72-hour cancellation window has lapsed.

---

## 5. Business Invariants & Handover Rules

### 5.1 Cargo Shipping vs. Safe Meetup Delivery
- **`CARGO` Delivery:**
  - Seller submits `ShipOrderForm` choosing a supported carrier (`providerName`).
  - Backend returns a tracking code; status becomes `SHIPPED`.
  - Delivery is confirmed via carrier integration or auto-completed after 72 hours.
- **`SAFE_MEETUP` Handover:**
  - Buyer receives a 6-digit OTP code and QR code.
  - At the physical meetup, the seller inputs the code into `MeetupHandoverSection` or scans the QR.
  - If code matches, backend updates status to `HANDOVER_CONFIRMED`.

### 5.2 Item-Level Compensation Planning
- In accordance with backend architecture, cancellations and refunds operate at the individual `OrderItem` level rather than cancelling the entire order.
- Buyers can cancel unshipped items within 72 hours of order creation.

---

## 6. Backend Contract & Error Handling
- Exceptions are unwrapped via `errorUtils.getErrorMessage(err)`:
  - `ORDER_ALREADY_SHIPPED` -> "This order has already been shipped and cannot be cancelled directly."
  - `INVALID_HANDOVER_CODE` -> "The meetup verification code is incorrect."
  - `HANDOVER_LOCKED` -> "Too many failed attempts. Verification locked for 15 minutes."

---

## 7. Restrained Design Tokens & Anti-Patterns
- **Status Stepper:** Subtle neutral checkmarks and timeline bars (`bg-surface-secondary` with `text-content-primary`).
- **Typography:** Order numbers (`#ORD-XXXXXX`) and amounts use `font-mono tabular-nums`.
- **Zero Emojis:** Strictly prohibited across shipping badges, cancellation forms, and handover dialogs.
- **Radius Ceiling:** Cards, modals, and stepper pills adhere to `rounded-md`.
