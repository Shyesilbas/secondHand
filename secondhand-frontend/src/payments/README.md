# Payments UI Module

Financial transaction screens, eWallet management, listing fee settlements, and two-factor OTP verification.

## Architecture

- **`PayListingFeePage`:** Dedicated checkout view for draft and renewed listings requiring a publishing fee (`POST /v1/listings/pay-fee`). Displays listing summary, fee calculation, terms agreement, and triggers the 2FA verification modal.
- **`PaymentMethodsPage`:** Main financial hub displaying eWallet balance, available funds vs. escrow holds, daily/monthly spending limits, and quick-action triggers for deposits and withdrawals.
- **`PaymentsPage`:** Paginated transaction ledger showing historical payment records, statuses (`SUCCESS`, `PENDING`, `FAILED`), and summary statistics (`/v1/payments/my`, `/v1/payments/statistics`).
- **Modals & Verification Components:**
  - `PaymentVerificationModal`: Modal handling two-factor authentication for payment actions. Includes countdown timer, resend throttle, and error handling.
  - `OtpDigitInputGroup`: Accessible 6-digit input group with auto-advance, backspace focus shifting, and clipboard paste support.
  - `OtpSuggestionBanner`: Suggestion pill allowing one-click paste when an OTP verification code is received via in-app email.
  - `WalletOperationModal`: Modal facilitating top-up (deposit) and bank withdrawal operations with real-time limit validation.
- **Key Hooks:**
  - `useListingPaymentFlow`: Orchestrates the listing fee payment flow, step transitions, OTP modal state, and redirect to the newly activated listing upon success.
  - `usePayments`: Manages paginated payment history and overview statistics queries.
  - `useFinancialAccountManager`: Coordinates wallet balance, deposit/withdraw modal visibility, and mutation execution.
  - `useOtpValidityCountdown`: Manages the 180-second validity window for OTP verification codes.

## Invariants

- **Single Payment Provider:** `EWALLET` is the exclusive payment method for listing fees, purchases, and escrow settlements. No direct credit card or external gateway inputs exist on the client.
- **Mandatory 2FA Verification:** Initiating listing fee payments or balance withdrawals requires sending an OTP via `paymentService.initiateVerification` (`ITEM_PURCHASE` or `WITHDRAWAL`) and providing the 6-digit code in the payload.
- **Atomic Cache Eviction:** Any completed payment or wallet mutation invalidates `['ewallet', 'balance']`, `['payments', 'my']`, `['payments', 'statistics']`, and `['listings', 'my']` to guarantee balance and listing status consistency.
- **Restrained Styling:** Follows `.agents/skills/restrained-ui-design-standard/SKILL.md`: clean tabular-nums formatting, hairline dividers, neutral cards, zero emojis, and explicit disabled states during ongoing transactions.
