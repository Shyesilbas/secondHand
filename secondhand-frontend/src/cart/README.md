# Cart & Checkout UI Module

> [!NOTE]
> **Backend Counterpart & Architecture Deep Dive:**
> - **Backend Module:** [`cart`](../../../src/main/java/com/serhat/secondhand/cart/README.md)
> - **Architecture Deep Dive:** [`docs/stock-reservation-and-reconciliation.md`](../../../docs/stock-reservation-and-reconciliation.md)
> - **Architecture Deep Dive:** [`docs/checkout-pipeline-and-distributed-transaction-flow.md`](../../../docs/checkout-pipeline-and-distributed-transaction-flow.md)

## 1. Executive Summary & Route Map

| Path | Page | Access |
|---|---|---|
| `/cart` | `ShoppingCartPage` | Protected |
| `/checkout` | `CheckoutPage` | Protected |

## 2. React Query Keys

Generated from code; the hook files are the source of truth.

| Query key | Defined in |
|---|---|
| `['activeCoupons']` | `ActiveCouponsModal.jsx` |
| `['cartItems', user?.id]` | `useCart.js` |
| `['cartPricingAndCampaigns', cartKey, sellerIds, appliedCouponCode]` | `ShoppingCartPage.jsx` |
| `['checkoutPreview', cartKey, appliedCouponCode, offerId]` | `CheckoutPage.jsx` |
| `['listing', 'social-proof', listingId]` | `useActiveReservationCount.js` |
| `['offerContext', offerId]` | `CheckoutPage.jsx` |

| Invalidated / updated key | By |
|---|---|
| `['cartItems']` | `useCart.js` |

## 3. Form & Business Invariants

### 15-Minute Stock Reservation Synchronization
- When entering `/checkout`, the backend reserves physical stock in Redis for 900 seconds (`reserve_stock_with_ttl.lua`).
- `CheckoutPage` stores the expiration timestamp in `sessionStorage` (`checkout_reservation_expiry`); `useReservationTimer` drives the countdown.
- On page refresh, the timer recalculates remaining time from `sessionStorage` rather than restarting from 15:00.
- If the countdown reaches 00:00, `ReservationModal` opens, blocking checkout submission and releasing held inventory.

### Multi-Seller Split Order Recipient
- Backend `/api/v1/checkout` automatically splits cart items by seller into separate orders.
- `useCheckout.navigateToOrderSuccess` receives `{ orders: [...], totalAmount }` and forwards the array to `OrderSuccessPage`.

### Mandatory eWallet Spending Limit Check
- In Step 2 (Payment), before OTP generation, `useCheckout` evaluates monthly spending limits via `ewalletService.checkSpendingWarning`.
- If the cart total exceeds the user's configured warning threshold, `EWalletSpendingWarningModal` prompts the buyer for explicit confirmation.
