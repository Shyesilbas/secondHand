# Payment Feature Development Runbook

## Purpose
Provides a structured checklist for developers and AI agents when making cross-cutting feature additions to the payment module.

## When to Load
- When explicitly requested to evaluate the impact of a broad payment feature.
- When adding a feature that touches multiple payment layers (pre-check, strategy, event-handler, escrow).

## When NOT to Load
- When resolving specific isolated bugs (use Troubleshooting KIs instead).
- When modifying only a specific payment method (use `add-payment-strategy.md`).
- When the task is isolated to a post-payment notification (use `add-event-handler.md`).

## Assumptions
- General payment domain invariants (Idempotency, Escrow flow) apply to the new feature.

## Procedure
1. Identify the level of the feature: `pre-check`, `strategy`, `processor`, `event-handler`, or `escrow`.
2. Map the impact across: API/DTO, Domain Service, Strategy/Validator, and Repository/Entity.
3. Validate Idempotency: Ensure new changes do not distribute idempotency rules outside `PaymentProcessor`.
4. Validate Verification: Ensure verification constraints remain in the `pre-check` phase.
5. Validate Escrow Orchestration: Maintain the strict separation of escrow orchestrator and executor.
6. Design test coverage including double requests (idempotency), verification required paths, handler ordering, and escrow outcomes.

## Pitfalls
- Breaking the single responsibility of `PaymentProcessor` regarding idempotency.
- Failing to write tests that ensure double-request robustness.

## Related Files
- `src/main/java/com/serhat/secondhand/payment/application/PaymentProcessor.java`
- `src/main/java/com/serhat/secondhand/payment/application/PaymentPreCheckService.java`
