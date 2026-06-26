# Payments UI Module

## Purpose
The `payments` UI module manages eWallet interactions including displaying balance limits, transaction history, and mock top-up/withdrawal screens.

## Architecture Overview
- **PaymentMethodsPage:** Main container for eWallet features.
- **paymentService.js:** Interface to the backend payment APIs.
- **Queries:** React query hooks for fetching wallet statistics and transaction lists.

## Business Invariants & Constraints
- **eWallet Only:** Currently, the UI only supports eWallet flows. Credit card and bank integrations have been removed. Any future payment methods must strictly align with the backend `PaymentStrategy` contract before UI enablement.

## Integration Points
- **Incoming:** User navigation to the payment methods view.
- **Outgoing:** Interacts with the backend `ewallet` and `payment` domains.

## Related Knowledge
- *(No runbooks extracted; UI consists of standard data fetching and form submissions)*
