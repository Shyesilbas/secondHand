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

## 2. React Query Keys

Generated from code; the hook files are the source of truth.

| Query key | Defined in |
|---|---|
| `[...EWALLET_KEYS.wallet, user?.id]` | `useEWallet.js` |

| Invalidated / updated key | By |
|---|---|
| `EWALLET_KEYS.wallet` | `useEWallet.js` |

## 3. Business Invariants & Spending Warnings

1. **Non-Negative Balance:** The frontend checks available balance against checkout totals (`eWallet.balance >= calculateTotal()`) before enabling order placement.
2. **Pre-Checkout Limit Warning:** If monthly spending + cart total > `spendingWarningLimit`, `EWalletSpendingWarningModal` requires user acknowledgment before sending OTP.
3. **Pessimistic Backend Lock Coordination:** Client respects that concurrent backend adjustments use `SELECT FOR UPDATE` on `ewallets`.
