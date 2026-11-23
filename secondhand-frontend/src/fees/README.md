# Fees Module

Public page that explains platform costs: listing fee scope, commission tiers and the flat shipping fee. Data comes from the backend fee schedule, never from hard-coded numbers.

## Route Map
- `ROUTES.FEES` renders `FeesPage` (lazy, public). Linked from the footer, the listing form note and announcement mails.

## Content
- Cards: commission bands, listing fee scope, shipping fee, showcase; then explanations (how commission is calculated, worked examples computed from the bands, who pays what, cancellation and coupon rules). All numbers come from the schedule.

- The shipping card and explanations also describe the free-shipping threshold when `freeShippingThreshold` is set.

## Data
- `useFeeSchedule` (query keys `FEE_KEYS`) calls `feeService`, which uses `API_ENDPOINTS.FEES.SCHEDULE`.
- Checkout also reads `useFeeSchedule` for the shipping line; amounts must match the backend `FeeScheduleService`.
