# eWallet UI Module

Digital wallet balance, deposit/top-up, withdrawal, transaction history ledger, and spending safeguards.

## Architecture
- `useEWallet`: React Query hook managing live wallet balance, monthly spending limits, and transaction logs.
- `ewalletService`: API adapter communicating with `/api/v1/ewallet/*` endpoints.
- `EWalletSpendingWarningModal`: Modal alerting users when approaching configured daily or monthly spending limits.

## Invariants
- **Optimistic State Eviction:** Deposits, withdrawals, and escrow releases invalidate `['ewallet', 'balance']` and `['ewallet', 'transactions']` queries concurrently.
- **Single Source of Balance:** Balance figures rendered across navigation headers, checkout payment summaries, and account hubs synchronize from a single query key.
