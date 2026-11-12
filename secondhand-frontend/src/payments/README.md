# Payments UI Module

> [!NOTE]
> **Backend Counterpart & Architecture Deep Dive:**
> - **Backend Module:** [`payment`](../../../src/main/java/com/serhat/secondhand/payment/README.md)
> - **Architecture Deep Dive:** [`docs/payment-strategy-and-provider-extension-guide.md`](../../../docs/payment-strategy-and-provider-extension-guide.md)

## 1. Executive Summary & Route Map
The `payments` module provides the customer-facing financial management hub, historical payment ledger, listing fee checkout, and two-factor authentication (2FA OTP) verification dialogs.

### Route Map
| Route Path | Component | Access | Lazy Loaded | Purpose |
|---|---|---|---|---|
| `/payments` | `PaymentsPage` | `Protected` | Yes | Paginated transaction ledger and summary statistics |
| `/payments/methods` | `PaymentMethodsPage` | `Protected` | Yes | eWallet balance, escrow holds, deposit/withdrawal modals |
| `/listings/pay-fee/:id` | `PayListingFeePage` | `Protected` | Yes | Listing publication fee settlement via eWallet + 2FA |

---

## 2. Component Hierarchy & File Structure

```
src/payments/
├── pages/
│   ├── PaymentsPage.jsx                # Historical payments ledger and status filters
│   ├── PaymentMethodsPage.jsx          # Wallet overview, limit settings, deposit triggers
│   └── PayListingFeePage.jsx           # Single-listing fee checkout and agreement review
├── components/
│   ├── PaymentNavigation.jsx           # Tab switcher between Ledger, Methods, and Draft Fees
│   ├── PaymentHistory.jsx              # Tabular ledger with status badges and date filters
│   ├── WalletOverview.jsx              # Large-format balance card, escrow holds, and quick actions
│   ├── DraftListingsList.jsx           # Unpaid draft listings awaiting fee settlement
│   ├── PaymentAgreementsSection.jsx    # Mandatory legal terms checkbox list before payment
│   ├── PaymentPanel.jsx                # Compact payment summary widget for fee checkouts
│   ├── payment-methods/
│   │   └── EWalletSection.jsx          # eWallet specific funding source card
│   ├── modals/
│   │   └── WalletOperationModal.jsx    # Top-up and withdrawal dialog with bank IBAN inputs
│   └── verification/
│       ├── PaymentVerificationModal.jsx# 2FA dialog coordinating OTP entry and validity timer
│       ├── OtpDigitInputGroup.jsx      # 6-box auto-advancing accessible digit input
│       └── OtpSuggestionBanner.jsx     # One-click paste pill when OTP is delivered in-app
├── hooks/
│   ├── usePayments.js                  # React Query hook for transaction ledger and stats
│   ├── useListingPaymentFlow.js        # Step-by-step listing fee coordinator
│   ├── useFinancialAccountManager.js   # Orchestrates wallet mutations (deposit, withdraw)
│   ├── useOtpValidityCountdown.js      # 180-second countdown hook for OTP codes
│   ├── useOtpSuggestedToast.js         # Listens for fresh OTP emails and displays toast
│   └── queries.js                      # Centralized React Query options for payments
├── services/
│   └── paymentService.js               # Raw Axios API calls (/api/v1/payments/**)
├── utils/
│   ├── formatPaymentAmount.js          # Currency formatting (TRY/USD/EUR) with symbol placement
│   └── otp.js                          # OTP parsing, clipboard paste sanitizer, regex check
└── paymentSchema.js                    # Zod validation schemas for wallet top-up and OTP
```

---

## 3. React Query 5 Data Flow & Query Key Invalidation Matrix

### Query Key Topology
- `['payments', 'my', { page, size, status }]`: Paginated user transaction ledger.
- `['payments', 'statistics']`: Aggregated spending and incoming revenue metrics.
- `['ewallet', 'balance']`: Live wallet balance and locked escrow sums.
- `['listings', 'my', 'draft']`: Draft listings requiring fee payment.

### Invalidation Matrix
| Mutation Hook | Endpoint | Invalidated Query Keys | UX Impact |
|---|---|---|---|
| `processListingPayment` | `POST /api/v1/payments/process` | `['payments', 'my']`, `['ewallet', 'balance']`, `['listings', 'my']` | Activates listing and deducts fee from wallet |
| `depositWallet` | `POST /api/v1/ewallet/deposit` | `['ewallet', 'balance']`, `['payments', 'my']` | Refreshes balance immediately after funding |
| `withdrawWallet` | `POST /api/v1/ewallet/withdraw` | `['ewallet', 'balance']`, `['payments', 'my']` | Reflects pending withdrawal reduction |
| `initiateVerification` | `POST /api/v1/payments/initiate-verification` | None | Dispatches OTP to user email and triggers countdown |

---

## 4. 4-State UX Handling Discipline

1. **Loading State:**
   - `PaymentsPage`: Renders `<Skeleton>` rows inside the transaction table.
   - `PaymentMethodsPage`: Renders card-level skeleton blocks for wallet balance and escrow sums.
2. **Empty State:**
   - If no transactions exist, renders `<EmptyState>` with a credit card icon and message: "No payment transactions recorded yet."
   - If no draft listings require fees, displays an empty state encouraging the user to create an item.
3. **Error State:**
   - Displays dismissible `<Alert variant="error">` banners for OTP verification failures or bank withdrawal rejections using `errorUtils.getErrorMessage(err)`.
4. **Disabled / Submitting State:**
   - Action buttons inside `WalletOperationModal` and `PaymentVerificationModal` enter a disabled state with a spinner while mutations are pending.
   - `OtpDigitInputGroup` inputs are locked during OTP verification.

---

## 5. Form & Security Invariants

### 5.1 Exclusive eWallet Payment Method
- In accordance with backend architecture, `EWALLET` is the platform's primary payment rail for listing fees, purchases, and escrow payouts.
- Frontend does not store or process raw credit card numbers.

### 5.2 Two-Factor OTP Verification Protocol
- Any listing fee payment or wallet withdrawal must execute 2FA:
  1. Calls `paymentService.initiateVerification({ transactionType })`.
  2. `PaymentVerificationModal` opens with a 180-second countdown (`useOtpValidityCountdown`).
  3. `OtpDigitInputGroup` auto-focuses the first digit and auto-advances on keystroke.
  4. `OtpSuggestionBanner` detects newly arrived OTP codes via in-app email polling and offers a one-click "Fill Code" action.
  5. The 6-digit code is submitted with the payment payload (`verificationCode`).

---

## 6. Backend Contract & Safe Error Handling
- Verification and payment exceptions are resolved via `errorUtils.getErrorMessage(err)`:
  - `VERIFICATION_CODE_INVALID` -> "The 6-digit verification code entered is incorrect."
  - `VERIFICATION_CODE_EXPIRED` -> "The verification code has expired. Please request a new one."
  - `INSUFFICIENT_WALLET_BALANCE` -> "Insufficient funds. Please top up your eWallet balance."
- Avoids raw Axios error output in all modal interfaces.

---

## 7. Restrained Design Tokens & Anti-Patterns
- **Numerical Formatting:** All balances, escrow amounts, and fee lines use `font-mono tabular-nums`.
- **Status Pills:** Transaction states use subtle neutral indicators (`bg-surface-secondary text-content-primary`).
- **No Emojis:** Strictly prohibited across payment buttons, balance cards, and OTP dialogs.
- **Radius Ceiling:** All wallet cards, buttons, and OTP inputs adhere to `rounded-md`.
