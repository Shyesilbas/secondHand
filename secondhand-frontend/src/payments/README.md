# Payments UI Module

> [!NOTE]
> **Backend Counterpart & Architecture Deep Dive:**
> - **Backend Module:** [`payment`](../../../src/main/java/com/serhat/secondhand/payment/README.md)
> - **Architecture Deep Dive:** [`docs/payment-strategy-and-provider-extension-guide.md`](../../../docs/payment-strategy-and-provider-extension-guide.md)

## 1. Executive Summary & Route Map

| Path | Page | Access |
|---|---|---|
| `/payment-methods` | `PaymentMethodsPage` | Protected |
| `/payments` | `PaymentsPage` | Protected |
| `/payments/listing-fee` | `PayListingFeePage` | Protected |

## 2. React Query Keys

Generated from code; the hook files are the source of truth.

| Query key | Defined in |
|---|---|
| `[...PAYMENT_QUERY_KEYS.draftListings, user?.id]` | `useListingPaymentFlow.js` |
| `[...PAYMENT_QUERY_KEYS.emailsMy, user?.id]` | `useEmails.js` |
| `[...PAYMENT_QUERY_KEYS.listingFeeQuote, user?.id]` | `queries.js` |
| `[...PAYMENT_QUERY_KEYS.paymentStatistics, user?.id, providerName]` | `queries.js` |
| `[...PAYMENT_QUERY_KEYS.payments, 'my', 'list', userId || 'anonymous', currentPage, pageSize, filters]` | `queries.js` |

| Invalidated / updated key | By |
|---|---|
| `PAYMENT_QUERY_KEYS.draftListings` | `useListingPaymentFlow.js` |
| `['ewallet']` | `useListingPaymentFlow.js` |
| `PAYMENT_QUERY_KEYS.listingFeeQuote` | `useListingPaymentFlow.js` |
| `['myListings']` | `useListingPaymentFlow.js` |
| `['payments']` | `useListingPaymentFlow.js` |
| `[...PAYMENT_QUERY_KEYS.emailsMy, user?.id]` | `useEmails.js` |

## 3. Form & Security Invariants

### Exclusive eWallet Payment Method
- In accordance with backend architecture, `EWALLET` is the platform's primary payment rail for listing fees, purchases, and escrow payouts.
- Frontend does not store or process raw credit card numbers.
- Amounts, fee coverage and statistics come from the backend: the pay button reads `sufficientBalance` from `useListingFeeQuoteQuery`, the stat cards read `PaymentStatisticsDto` fields, and ledger rows are shown as `PaymentDto` sends them. Search, direction and type filters run on the backend.

### Two-Factor OTP Verification Protocol
- Any listing fee payment or wallet withdrawal must execute 2FA:
  1. Calls `orderService.initiatePaymentVerification({ transactionType })`, which returns the backend `expiresAt`.
  2. `PaymentVerificationModal` counts down to that `expiresAt` (`useOtpValidityCountdown`); the TTL is never hardcoded.
  3. `OtpDigitInputGroup` auto-focuses the first digit and auto-advances on keystroke.
  4. `OtpSuggestionBanner` detects newly arrived OTP codes via in-app email polling and offers a one-click "Fill Code" action.
  5. The 6-digit code is submitted with the payment payload (`verificationCode`).
