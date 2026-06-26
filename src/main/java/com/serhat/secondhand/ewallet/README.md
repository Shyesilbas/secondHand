# EWallet Domain

## Purpose
The `ewallet` domain manages the internal electronic wallets for users, handling balances, deposit/withdrawal limits, and spending warnings.

## Architecture Overview
- **EWalletService:** Handles the business logic for balance modification and warning threshold calculation.
- **EWalletValidator:** Strictly enforces sufficient balance and limit rules.
- **Pessimistic Locking:** Database locks (`findByUserWithLock`) are used to prevent race conditions during concurrent transactions.

## Business Invariants & Constraints
- **Sufficient Balance:** A wallet balance can never drop below zero.
- **Concurrency Protection:** Any balance modification MUST acquire a pessimistic write lock before calculation.
- **Counterpart Tracking:** `from_user_id` is NOT NULL; every transaction (even system refunds) must record the correct ownership trace.
- **Spending Warning:** Limits are calculated based on monthly OUTGOING successful transactions.

## State Machines
- **Balance Lifecycle:** Credit / Debit operations. (Currently mocked for top-ups).

## Integration Points
- **Incoming:** `CheckoutOrchestrator` calls this domain to verify spending limits before order execution.
- **Outgoing:** Emits payment records to the `payment` domain upon balance modifications.

## Public APIs
- Balance verification, simulated top-up, and simulated withdrawal endpoints.

## Related Knowledge
- **Modify EWallet Rules**
  -> `.docs/runbooks/modify-ewallet-rules.md`
