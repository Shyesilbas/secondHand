# Add Payment Event Handler

## Purpose
Provides instructions for adding post-payment side effects (e.g., notifications, integrating with other domains) that execute after a successful payment transaction is committed.

## When to Load
- When explicitly adding a new side-effect that must trigger after a payment.
- When refactoring the `PaymentCompletedHandler` registry or logic.

## When NOT to Load
- When modifying the core payment processing logic or strategies.
- When debugging optimistic locking or idempotency issues.
- When creating a new payment method.

## Assumptions
- Post-payment actions occur in the `AFTER_COMMIT` phase of the transaction.
- The `PaymentProcessor` handles the main transaction; handlers handle side-effects only.

## Procedure
1. Create a new handler class implementing the `PaymentCompletedHandler` interface.
2. Define the `supports` condition strictly to determine when this handler should execute based on the transaction type.
3. Determine and assign the `@Order` explicitly to position it correctly within the handler execution sequence.
4. Document the idempotency expectation within the handler logic itself.
5. Ensure that the handler logic never alters the core payment state directly.

## Pitfalls
- Broad or non-deterministic `supports` conditions causing unintended handler execution.
- Executing side-effects before the main transaction commit, leading to phantom data or partial failures.

## Related Files
- `src/main/java/com/serhat/secondhand/payment/application/PaymentCompletedEventListener.java`
- `src/main/java/com/serhat/secondhand/payment/application/PaymentCompletedHandlerRegistry.java`
