# Order UI Module

> [!NOTE]
> **Backend Counterpart & Architecture Deep Dive:**
> - **Backend Module:** [`order`](../../../src/main/java/com/serhat/secondhand/order/README.md)
> - **Architecture Deep Dive:** [`docs/order-lifecycle-and-compensation-management.md`](../../../docs/order-lifecycle-and-compensation-management.md)
> - **Architecture Deep Dive:** [`docs/safe-meetup-delivery-and-verification.md`](../../../docs/safe-meetup-delivery-and-verification.md)

## 1. Executive Summary & Route Map

| Path | Page | Access |
|---|---|---|
| `/orders/success` | `OrderSuccessPage` | Protected |
| `/profile/i-sold` | `ISoldPage` | Protected |
| `/profile/orders` | `MyOrdersPage` | Protected |
| ``${ROUTES.I_SOLD` | `OrderShipmentPage` | Protected |
| ``${ROUTES.MY_ORDERS` | `OrderShipmentPage` | Protected |

## 2. React Query Keys

Generated from code; the hook files are the source of truth.

| Query key | Defined in |
|---|---|
| `ORDER_QUERY_KEYS.detail(order.id, !isBuyer)` | `OrdersListLayout.jsx` |
| `ORDER_QUERY_KEYS.itemReviews(ids)` | `useOrderItemReviews.js` |
| `ORDER_QUERY_KEYS.orderShipment(scope, orderId)` | `OrderShipmentPage.jsx` |
| `ORDER_QUERY_KEYS.pendingEscrow(user?.id)` | `useOrderFlow.js` |
| `ORDER_QUERY_KEYS.sellerStatusCounts(user?.id, 'ALL')` | `useSellerToShipCount.js` |
| `['orders', 'meetupQr', order.orderNumber]` | `MeetupHandoverSection.jsx` |
| `isSeller` | `useOrderFlow.js` |
| `navOrderId` | `OrderSuccessPage.jsx` |

| Invalidated / updated key | By |
|---|---|
| `ORDER_QUERY_KEYS.escrow` | `useOrderFlow.js` |
| `ORDER_QUERY_KEYS.orders` | `useOrderFlow.js` |
| `PAYMENT_QUERY_KEYS.paymentStatistics` | `useOrderFlow.js` |
| `PAYMENT_QUERY_KEYS.payments` | `useOrderFlow.js` |
| `mode` | `useOrderFlow.js` |

## 3. Business Invariants & Handover Rules

### Cargo Shipping vs. Safe Meetup Delivery
- **`CARGO` Delivery:**
  - Seller submits `ShipOrderForm` choosing a supported carrier (`providerName`).
  - Backend returns a tracking code; status becomes `SHIPPED`.
  - Delivery is confirmed via carrier integration or auto-completed after 72 hours.
- **`SAFE_MEETUP` Handover:**
  - Buyer receives a 6-digit OTP code and QR code.
  - At the physical meetup, the seller inputs the code into `MeetupHandoverSection` or scans the QR.
  - If code matches, backend updates status to `HANDOVER_CONFIRMED`.

### Backend-Driven Actions and Deadlines
- Every button, form and countdown reads the order's backend fields: `allowedActions` via `hasOrderAction`, `shipDeadline`, `autoCompleteAt`, `meetupCodeExpiresAt` and seller `sellerTotal`. Never derive an action, deadline or amount from `status` or timestamps.
- Cancellation and refund are per `OrderItem`; `CancelRefundModal` lists only lines with `remainingQuantity > 0`.
