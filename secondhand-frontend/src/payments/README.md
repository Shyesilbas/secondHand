# Payments Frontend

The payments UI is currently eWallet-only.

- `pages/PaymentMethodsPage.jsx`: wallet balance, limits, mock top-up and mock withdrawal.
- `paymentSchema.js`: payment constants and DTO normalizers.
- `services/paymentService.js`: payment history, listing-fee payment, statistics and verification calls.
- `hooks/queries.js`: payment list and statistics queries.

Credit card and bank account screens/endpoints were removed. Future payment methods should be added through the backend `PaymentStrategy` contract first, then exposed in this frontend module deliberately.
