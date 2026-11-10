# Cart & Checkout UI Module

Shopping cart management, item selection, coupon application, Redis stock reservation countdown, and checkout flow.

## Architecture
- `useCart`: React Query hook managing active cart items, item removal, quantity updates, and clear-cart mutations.
- `useCheckout`: Multi-step checkout state manager handling address selection, delivery mode (`CARGO` vs `SAFE_MEETUP`), and order placement.
- Checkout steps (`CART_CHECKOUT_STEPS`): 1 Teslimat, 2 Ödeme ve onay (delivery recap, wallet balance, agreements, spending-limit check, sends the OTP), 3 Doğrulama. The spending-limit warning is shown only in step 2 (`ewalletService.checkSpendingWarning`); line prices come from `utils/checkoutLinePricing.js`.
- `useReservationTimer`: Synchronizes the 15-minute checkout stock hold returned from `/api/checkout/initiate` (`remainingTtlSeconds`), preventing countdown resets on page refresh via `sessionStorage`.
- `useActiveReservationCount`: Fetches non-polling social proof indicators for active cart counts.

## Invariants
- **Stock Reservation Sync:** When navigating to `CheckoutPage`, `orderService.initiateCheckoutReservation()` holds inventory in Redis for 15 minutes. The remaining TTL is synced to `sessionStorage` (`checkout_reservation_expiry`) to survive page reloads. If the countdown expires or backend reservation fails, checkout is blocked and inventory is released automatically via Redis TTL.
- **Refresh Safety:** If the user refreshes `CheckoutPage`, the timer continues from the remaining backend TTL rather than restarting from 15:00.
- **Coupon Invalidation:** Applying or removing a coupon recalculates totals client-side and refreshes cart query keys immediately.
- **Design Tokens:** Strict adherence to `.agents/skills/restrained-ui-design-standard/SKILL.md`: no emojis in countdown alerts, neutral order summary cards, and hairline borders.
