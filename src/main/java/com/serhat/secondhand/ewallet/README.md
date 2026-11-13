# EWallet Domain

Manages internal user virtual balances (`e_wallets` table), deposits, withdrawals, spending warning limits, and checkout/escrow settlement via `EWalletPaymentProviderAdapter`.

> [!NOTE]
> **Related Documentation & Runbooks:**
> - **Architecture Deep Dive:** [`docs/payment-strategy-and-provider-extension-guide.md`](/docs/payment-strategy-and-provider-extension-guide.md) (adapter contract & lock-under-idempotency flow)
> - **Architecture Deep Dive:** [`docs/checkout-pipeline-and-distributed-transaction-flow.md`](/docs/checkout-pipeline-and-distributed-transaction-flow.md)
> - **Frontend Module:** [`secondhand-frontend/src/ewallet/README.md`](/secondhand-frontend/src/ewallet/README.md)
> - **Key Entry Points:** [`EWalletController`](api/EWalletController.java) · [`EWalletService`](application/EWalletService.java) · [`IEWalletService`](application/IEWalletService.java) · [`EWalletValidator`](validator/EWalletValidator.java) · [`EWalletPaymentProviderAdapter`](adapter/in/EWalletPaymentProviderAdapter.java)

## Business Rules & Invariants
- **Pessimistic Row Lock First (`findByUserIdForUpdate`):** Every balance mutation (deposit, withdraw, checkout debit, escrow credit) acquires a PostgreSQL `FOR UPDATE` row lock on `e_wallets` before checking balances or mutating state.
- **Idempotency Under Lock (`alreadyApplied`):** Deposit, withdrawal, and payment mutations verify under the wallet row lock whether `idempotencyKey` was already recorded in `payments`, preventing duplicate charges on concurrent retries.
- **Non-Negative Floor & 2-Decimal Precision:** `EWalletValidator` enforces `amount > 0`, `balance >= amount` on debits, and optional `walletLimit`. Balances are scaled to 2 decimal places (`RoundingMode.HALF_UP`) via `EWalletBalanceUtil.scale`.
- **Proactive Monthly Spending Warning:** If `monthlyCompletedOutgoingSpend + requestedAmount > spendingWarningLimit`, the check endpoint alerts the user without blocking transactions.
- **Payment Provider Adapter:** `EWalletPaymentProviderAdapter` implements `PaymentProviderPort` (`supports("EWALLET")`).
- **Change rule:** Every balance mutation runs inside `findByUserWithLock`; no network calls while the lock is held.
- **Change rule:** `fromUser` is never null, including system refunds.

## Redis, Outbox & Kafka
- Evicts Spring cache `payment:stats` (`@CacheEvict(value = "payment:stats", allEntries = true)`) on wallet ledger mutations.

## API (`EWalletController`, `/api/v1/e-wallets`)
- `POST /` — create eWallet for the authenticated user (`EwalletRequest`).
- `GET /` — current balance, currency, and limits.
- `POST /deposit` — deposit funds (`Idempotency-Key` header required, `DepositRequest`).
- `POST /withdraw` — withdraw funds to bank account (`Idempotency-Key` header required, `WithdrawRequest`).
- `PUT /update/spending-warning` & `DELETE /update/spending-warning` — set or clear `spendingWarningLimit`.
- `GET /balance/check?amount=` — boolean check if balance covers `amount`.
- `GET /spending-warning/check?amount=` — boolean check if `amount` crosses monthly warning threshold.
- `GET /transactions` — paginated wallet transaction history.
