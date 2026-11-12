# Cart & Checkout UI Module

## 1. Executive Summary & Route Map
The `cart` module orchestrates shopping cart state management, line-item pricing recalculation, seller-based campaign/coupon discounts, active checkout stock reservation with anti-hoarding countdowns, and the multi-step checkout wizard.

### Route Map
| Route Path | Component | Access | Lazy Loaded | Purpose |
|---|---|---|---|---|
| `/cart` | `ShoppingCartPage` | `Public` / `Protected` | Yes | Active cart inspection, quantity edits, coupon application |
| `/checkout` | `CheckoutPage` | `Protected` | Yes | 3-step checkout wizard (Delivery, Payment & OTP, Order Success) |
| `/order/success` | `OrderSuccessPage` | `Protected` | Yes | Multi-seller split order confirmation recap |

---

## 2. Component Hierarchy & File Structure

```
src/cart/
├── pages/
│   ├── ShoppingCartPage.jsx            # Cart item ledger, coupon entry, order summary
│   └── CheckoutPage.jsx                # Multi-step checkout wizard container
├── components/
│   ├── CartItemCard.jsx                # Individual line-item with image, price, quantity controls
│   ├── OrderSummary.jsx                # Sticky subtotal, campaign discount, coupon savings card
│   ├── ClearCartModal.jsx              # Confirmation dialog before wiping cart contents
│   ├── ReservationModal.jsx            # Active reservation warning / expiration notice
│   └── checkout/
│       ├── CheckoutProgressBar.jsx     # Visual step indicator (1: Delivery, 2: Payment, 3: Verification)
│       ├── CheckoutStep.jsx            # Collapsible step accordion container
│       ├── CheckoutAddressStep.jsx     # Shipping and billing address selection cards
│       ├── CheckoutPaymentStep.jsx     # eWallet balance, agreement checkboxes, spending limit warning
│       ├── CheckoutVerificationStep.jsx# 6-digit OTP verification and resend throttle
│       ├── CheckoutOrderSummary.jsx    # Checkout-specific line pricing and total breakdown
│       ├── CheckoutStepFooter.jsx      # Navigation buttons (Next Step, Back, Confirm)
│       └── ActiveCouponsModal.jsx      # Modal browsing eligible platform and seller coupons
├── hooks/
│   ├── useCart.js                      # React Query hook for cart items, mutations, and badge sync
│   ├── useCheckout.js                  # Multi-step checkout state coordinator and order submission
│   ├── useReservationTimer.js          # Synchronizes 15-minute Redis stock hold countdown
│   └── useActiveReservationCount.js    # Non-polling social proof demand indicators
├── services/
│   ├── cartService.js                  # Raw Axios endpoints (/api/v1/cart/**)
│   └── couponService.js                # Raw Axios endpoints (/api/v1/coupons/**)
├── utils/
│   ├── checkoutError.js                # Maps backend checkout error codes to safe localized copy
│   └── checkoutLinePricing.js          # Apportions coupon and campaign discounts per order line
└── cartConstants.js                    # Checkout step enums, payment types, default timeouts
```

---

## 3. React Query 5 Data Flow & Query Key Invalidation Matrix

### Query Key Topology
- `['cartItems', userId]`: Fetches active user cart items (`cartService.getCartItems()`).
- `['activeCoupons']`: Fetches platform-wide active coupons (`couponService.getActiveCoupons()`).
- `['addresses']`: Fetches user delivery and billing addresses from `user` module.
- `['ewallet', 'balance']`: Fetches available wallet funds from `ewallet` module.

### Invalidation Matrix
| Mutation Hook | Endpoint | Invalidated Query Keys | UX Impact |
|---|---|---|---|
| `addToCartMutation` | `POST /api/v1/cart/items` | `['cartItems']`, `['listings', 'detail', id]` | Updates cart badge and buy-box button state |
| `removeFromCartMutation` | `DELETE /api/v1/cart/items/{id}` | `['cartItems']` | Removes item card and recalculates subtotal |
| `updateQuantityMutation` | `PUT /api/v1/cart/items/{id}` | `['cartItems']` | Adjusts line item total and coupon eligibility |
| `clearCartMutation` | `DELETE /api/v1/cart` | `['cartItems']` | Resets cart to empty state; updates badge to 0 |
| `handleCheckout` | `POST /api/v1/checkout` | `['cartItems']`, `['ewallet', 'balance']`, `['orders', 'my']`, `['payments', 'my']` | Clears cart, docks wallet, redirects to `/order/success` |

---

## 4. 4-State UX Handling Discipline

1. **Loading State:**
   - `ShoppingCartPage`: Renders `<SkeletonGrid count={3} />` for line items and a skeleton card for `OrderSummary`.
   - `CheckoutPage`: Renders `<Skeleton>` bars matching the progress bar and address cards while initial profile addresses load.
2. **Empty State:**
   - When `cartItems.length === 0`, renders `<EmptyState>` with a shopping bag icon, empty cart message, and an action button directing the user to `/listings`.
   - Below the empty state, displays personalized recommendation carousels from `useFavorites`.
3. **Error State:**
   - Displays inline `<Alert variant="error">` banners inside `CheckoutOrderSummary` for stock reservation lapses or coupon incompatibilities using `getCheckoutErrorMessage(err)`.
4. **Disabled / Submitting State:**
   - Quantity decrement button is disabled when `quantity === 1`.
   - Checkout submit button is disabled when `proceedDisabled === true` (insufficient eWallet balance, missing address, or unaccepted agreements).
   - Shows loading spinner on checkout button while `isCheckingOut === true`.

---

## 5. Form & Business Invariants

### 5.1 15-Minute Stock Reservation Synchronization
- When entering `/checkout`, the backend reserves physical stock in Redis for 900 seconds (`reserve_stock_with_ttl.lua`).
- `useReservationTimer` stores the expiration timestamp in `sessionStorage` (`checkout_reservation_expiry`).
- On page refresh, the timer recalculates remaining time from `sessionStorage` rather than restarting from 15:00.
- If the countdown reaches 00:00, `ReservationModal` opens, blocking checkout submission and releasing held inventory.

### 5.2 Multi-Seller Split Order Recipient
- Backend `/api/v1/checkout` automatically splits cart items by seller into separate orders.
- `useCheckout.navigateToOrderSuccess` receives `{ orders: [...], totalAmount }` and forwards the array to `OrderSuccessPage`.

### 5.3 Mandatory eWallet Spending Limit Check
- In Step 2 (Payment), before OTP generation, `useCheckout` evaluates monthly spending limits via `ewalletService.checkSpendingWarning`.
- If the cart total exceeds the user's configured warning threshold, `EWalletSpendingWarningModal` prompts the buyer for explicit confirmation.

---

## 6. Backend Contract & Safe Error Handling
- Errors during checkout submission are parsed using `getCheckoutErrorMessage(err)`:
  - `INSUFFICIENT_STOCK` -> "Some items in your cart are no longer available in the requested quantity."
  - `COUPON_USAGE_LIMIT_EXCEEDED` -> "This coupon has reached its maximum redemption limit."
  - `WALLET_INSUFFICIENT_BALANCE` -> "Your eWallet balance is insufficient to complete this purchase."
- Raw Axios error objects are never displayed directly in UI alerts.

---

## 7. Restrained Design Tokens & Anti-Patterns
- **Typography:** Prices and countdown timers use `font-mono tabular-nums`.
- **Badges & Pills:** Coupon tags use neutral semantic borders (`border-border-subtle`).
- **Zero Emojis:** Prohibited across all countdown banners, cart item labels, and checkout step headers.
- **Radius Ceiling:** All cards, modals, and buttons adhere strictly to `rounded-md`.
