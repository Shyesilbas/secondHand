# Modify EWallet Rules

## Purpose
Execution instructions for modifying e-wallet balance limits, deposit/withdraw rules, or spending warnings.

## When to Load
- When adding new limits (e.g. daily limit) to the wallet.
- When changing the logic for balance deduction or top-up.

## When NOT to Load
- When fixing checkout payment orchestration issues.
- When modifying order creation.

## Assumptions
- `fromUser` is strictly tracked (not null) even for system refunds.
- Balance mutations MUST be secured via pessimistic locks.

## Procedure
1. If adding a new parameter, update the `EWallet` entity, DTOs, and Mapper.
2. Update `EWalletValidator` to enforce the new rule. Throw appropriate custom exceptions upon violation.
3. If it requires pre-transaction verification, create a specific endpoint (like `spending-warning/check`).
4. Ensure the lock model (`findByUserWithLock`) is strictly used in the mutating methods inside `EWalletService`. Do NOT execute long-running network calls inside the locked transaction.

## Pitfalls
- Breaking `findByUserWithLock` or performing modifications outside of a transactional boundary.
- Forgetting to log the corresponding `PaymentResult` record for auditability when updating a balance manually.

## Related Files
- `src/main/java/com/serhat/secondhand/ewallet/application/EWalletService.java`
- `src/main/java/com/serhat/secondhand/ewallet/validator/EWalletValidator.java`
