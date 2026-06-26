# Modify Escrow Behavior

## Purpose
Provides instructions for altering how funds are held in escrow, released to sellers, or refunded to buyers.

## When to Load
- When changing the logic of `EscrowService`.
- When integrating escrow logic with new payment types.

## When NOT to Load
- When dealing with order state transitions (handled in `order`).
- When dealing with eWallet balance queries.

## Assumptions
- Escrow relies on the Unified Payment Record (it shares state with `payment` and does not create parallel ledgers).

## Procedure
1. If modifying hold logic, focus on `EscrowService.hold`.
2. If modifying release logic, update `EscrowService.release` and ensure the wallet credit happens quietly (`creditWalletQuietly`).
3. Ensure all state changes emit the standard `PaymentCompletedEvent` rather than creating new custom notification events.
4. If modifying refunds, remember that refunds can *only* happen if the escrow state has not yet been released.

## Pitfalls
- Creating new `payment` records for escrow holds instead of sharing the `status=ESCROW` payment record.
- Refunding money to the seller instead of the buyer.

## Related Files
- `src/main/java/com/serhat/secondhand/escrow/application/EscrowService.java`
