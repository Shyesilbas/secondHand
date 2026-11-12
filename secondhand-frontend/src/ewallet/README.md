# eWallet UI Module

> [!NOTE]
> **Backend Counterpart & Architecture Deep Dive:**
> - **Backend Module:** [`ewallet`](../../../src/main/java/com/serhat/secondhand/ewallet/README.md)
> - **Architecture Deep Dive:** [`docs/escrow-lifecycle-and-state-machine.md`](../../../docs/escrow-lifecycle-and-state-machine.md)

## 1. Executive Summary & Architecture
The `ewallet` module manages the user's digital wallet balance, deposit and bank withdrawal requests, custom monthly spending limits, and preemptive checkout spending warning dialogs.

### Key Architectural Characteristics
- **Dedicated Hook (`useEWallet`):** Centralizes wallet balance retrieval, limit adjustments, and mutation operations with automatic toast notifications.
- **Spending Warning Safeguard (`EWalletSpendingWarningModal`):** Prompts the buyer with an explicit threshold warning if a pending transaction or checkout total exceeds their configured monthly limit.
- **Idempotency Protection:** Deposit and withdrawal calls generate and submit a client-side `idempotencyKey` to prevent double-charging on network retries.

---

## 2. Component Hierarchy & File Structure

```
src/ewallet/
├── components/
│   └── EWalletSpendingWarningModal.jsx # Confirmation dialog when purchase exceeds spending warning threshold
├── hooks/
│   └── useEWallet.js                   # React Query hook for wallet balance, limits, and mutations
├── services/
│   └── ewalletService.js               # Raw Axios API calls (/api/v1/ewallet/**)
└── README.md                           # Module documentation
```

---

## 3. React Query 5 Data Flow & Query Key Invalidation Matrix

### Query Key Topology
- `['ewallet', userId]`: Live wallet balance, currency, account limits, and warning threshold.
- `['ewallet', 'transactions', page, size]`: Paginated wallet credit/debit activity.

### Invalidation Matrix
| Mutation Hook | Endpoint | Invalidated Query Keys | UX Impact |
|---|---|---|---|
| `depositMutation` | `POST /api/v1/ewallet/deposit` | `['ewallet']` | Updates balance card immediately |
| `withdrawMutation` | `POST /api/v1/ewallet/withdraw` | `['ewallet']` | Decrements available balance |
| `updateLimitsMutation` | `PUT /api/v1/ewallet/limits` | `['ewallet']` | Updates monthly cap in UI |
| `updateSpendingWarningMutation` | `PUT /api/v1/ewallet/spending-warning` | `['ewallet']` | Adjusts prompt threshold for future checkouts |

---

## 4. 4-State UX Handling Discipline

1. **Loading State:**
   - Displays skeleton placeholders inside balance widgets while wallet data is fetched.
2. **Empty State:**
   - If user does not have an active wallet, `useEWallet` exposes `createMutation` to initialize a new wallet.
3. **Error State:**
   - Displays inline `<Alert variant="error">` banners for deposit rejections or limit calculation errors.
4. **Disabled / Submitting State:**
   - Deposit and withdrawal buttons enter a disabled loading state while mutations are processed.

---

## 5. Business Invariants & Spending Warnings

1. **Non-Negative Balance:** The frontend checks available balance against checkout totals (`eWallet.balance >= calculateTotal()`) before enabling order placement.
2. **Pre-Checkout Limit Warning:** If monthly spending + cart total > `spendingWarningLimit`, `EWalletSpendingWarningModal` requires user acknowledgment before sending OTP.
3. **Pessimistic Backend Lock Coordination:** Client respects that concurrent backend adjustments use `SELECT FOR UPDATE` on `ewallets`.

---

## 6. Backend Contract & Error Handling
- Exceptions are parsed via `errorUtils.getErrorMessage(err)`:
  - `WALLET_INSUFFICIENT_FUNDS` -> "Insufficient funds in your eWallet account."
  - `WALLET_MONTHLY_LIMIT_EXCEEDED` -> "Monthly transaction limit reached. Please adjust your account settings."

---

## 7. Restrained Design Tokens & Anti-Patterns
- **Typography:** Balances use `font-mono tabular-nums text-2xl font-semibold`.
- **Zero Emojis:** Prohibited in spending warnings, deposit modals, and transaction tags.
- **Radius Ceiling:** Modals and input fields adhere strictly to `rounded-md`.
