# Cart & Checkout UI Module

Shopping cart management, item selection, coupon application, Redis stock reservation countdown, and checkout flow.

## Architecture
- `useCart`: React Query hook managing active cart items, item removal, quantity updates, and clear-cart mutations.
- `useCheckout`: Multi-step checkout state manager handling address selection, delivery mode (`CARGO` vs `SAFE_MEETUP`), and order placement.
- `useReservationTimer`: Synchronizes the 15-minute checkout stock hold returned from `/api/checkout/initiate` (`remainingTtlSeconds`), preventing countdown resets on page refresh via `sessionStorage`.
- `useActiveReservationCount`: Fetches non-polling social proof indicators for active cart counts.

## Invariants
- **Stock Reservation Sync:** When navigating to `CheckoutPage`, the initiation endpoint holds inventory in Redis. Navigating away or canceling calls `DELETE /api/checkout/reservation/{listingId}`.
- **Refresh Safety:** If the user refreshes `CheckoutPage`, the timer continues from the remaining backend TTL rather than restarting from 15:00.
- **Coupon Invalidation:** Applying or removing a coupon recalculates totals client-side and refreshes cart query keys immediately.
- **Design Tokens:** Strict adherence to `DESIGN.md`: no emojis in countdown alerts, neutral order summary cards, and hairline borders.
