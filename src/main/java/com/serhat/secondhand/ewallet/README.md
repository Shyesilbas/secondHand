# EWallet Domain

## Purpose
The `ewallet` domain manages internal electronic wallets for users, handling balances, deposit/withdrawal limits, transaction histories, and proactive spending warnings.

## Architecture Overview
- **EWalletService:** Handles business logic for balance modification, limit adjustments, and warning threshold calculations.
- **EWalletValidator:** Strictly enforces sufficient balance and limit constraints.
- **Pessimistic Locking:** Database locks (`findByUserWithLock`) prevent race conditions during concurrent wallet modifications.
- **Transaction History:** Delegated to `PaymentStatsService` to retrieve EWALLET transactions from the central payment ledger.

## Business Invariants & Constraints
- **Sufficient Balance:** A wallet balance can never drop below zero.
- **Concurrency Protection:** Any balance modification MUST acquire a pessimistic write lock before calculation.
- **Counterpart Tracking:** `from_user_id` is NOT NULL; every transaction (even system refunds) records an immutable ownership trace.
- **Spending Warning:** Limits are evaluated based on monthly outgoing completed transactions.

## State Machines
- **Balance Lifecycle:** Credit / Debit operations. (Simulated external rails for deposits and withdrawals).

## Integration Points
- **Incoming:** `CheckoutOrchestrator` calls this domain to verify spending limits before order execution. Escrow Kafka consumers credit wallets on release.
- **Outgoing:** Emits payment records to the `payment` domain upon balance modifications.

## Public APIs
- `POST /api/v1/e-wallets`: Creates an e-wallet for the authenticated user.
- `GET /api/v1/e-wallets`: Returns current user's wallet details and available balance.
- `PUT /api/v1/e-wallets/update/spending-warning`: Sets or updates the monthly spending warning limit.
- `DELETE /api/v1/e-wallets/update/spending-warning`: Clears the monthly spending warning limit.
- `PUT /api/v1/e-wallets/limits`: Updates daily/monthly deposit and withdrawal limits.
- `POST /api/v1/e-wallets/deposit`: Deposits funds into the wallet (supports `Idempotency-Key`).
- `POST /api/v1/e-wallets/withdraw`: Withdraws funds from the wallet (supports `Idempotency-Key`).
- `GET /api/v1/e-wallets/balance/check?amount=...`: Checks if the wallet has sufficient balance for an amount.
- `GET /api/v1/e-wallets/spending-warning/check?amount=...`: Evaluates whether a transaction triggers spending alerts.
- `GET /api/v1/e-wallets/transactions`: Paginated transaction history for the user's wallet.

## Related Knowledge
- **Modify EWallet Rules**
  -> `.docs/runbooks/modify-ewallet-rules.md`
