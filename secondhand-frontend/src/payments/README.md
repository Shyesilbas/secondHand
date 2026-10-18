# Payments UI Module

eWallet screens: balance and limits, transaction history, top-up/withdraw. Main page: `PaymentMethodsPage`; API access via `paymentService.js`; talks to the backend `ewallet` and `payment` domains.

## Invariants
- eWallet is the only supported payment method (credit card and bank flows were removed). A new method needs a matching backend `PaymentProviderPort` adapter before the UI exposes it.
