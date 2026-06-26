# Add or Modify Payment Strategy

## Purpose
Provides instructions for adding a new payment method (e.g., eWallet, Credit Card) or modifying existing pre-check and strategy logic in the `payment` domain.

## When to Load
- When explicitly implementing a new payment method.
- When modifying `PaymentPreCheckService` or a `PaymentStrategy`.

## When NOT to Load
- When fixing an Escrow timeout bug.
- When adding a post-payment event handler.
- When modifying unrelated domains.

## Assumptions
- The new payment type must conform to the `PaymentStrategy` interface.
- Idempotency and verification are handled by the core processor, not the strategy.

## Procedure
1. Determine if the rule change belongs in `PaymentPreCheckService` (before strategy) or inside the specific `PaymentStrategy`.
2. Update `PaymentType` and, if necessary, transaction type enums.
3. Add the new `PaymentStrategy` implementation.
4. Integrate the new strategy into `PaymentStrategyFactory`.
5. Align error semantics with `PaymentErrorCodes`.
6. Update the corresponding request/validator/mapper objects synchronously.
7. Ensure verification requirements are explicitly defined if the new strategy requires OTP/Verification.

## Pitfalls
- Breaking `PaymentProcessor` flow by leaking idempotency rules into the strategy.
- Forgetting to align `PaymentErrorCodes`.

## Related Files
- `src/main/java/com/serhat/secondhand/payment/application/PaymentPreCheckService.java`
- `src/main/java/com/serhat/secondhand/payment/strategy/PaymentStrategy.java`
- `src/main/java/com/serhat/secondhand/payment/strategy/PaymentStrategyFactory.java`
