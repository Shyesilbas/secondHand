# Order Feature Development Runbook

## Purpose
A high-level checklist for developing new features that span multiple phases of the order lifecycle.

## When to Load
- When implementing a broad feature impacting order creation, transitioning, and completion.

## When NOT to Load
- When making isolated bug fixes.
- When adding a simple query endpoint.

## Assumptions
- The rich domain model of `Order` and its `policy` classes govern all state changes.

## Procedure
1. Clarify the affected lifecycle phases: creation, transition, completion, cancellation, or refund.
2. Define the exact rules in `policy` classes first.
3. Update `application` service orchestration to invoke the new policies.
4. If integrating with `payment`, ensure `order` acts only as the decision maker, not the executor of fund transfers.
5. Plan the event side-effects: which events must be fired, and what external domains will listen?
6. Write behavioral risk tests, specifically covering scheduler progression, escrow release failures, and partial cancellation scenarios.

## Pitfalls
- Bypassing policy classes and writing raw condition checks in services.
- Allowing listener side-effects to break the main transaction commit.

## Related Files
- `src/main/java/com/serhat/secondhand/order/entity/Order.java`
- `src/main/java/com/serhat/secondhand/order/application/`
