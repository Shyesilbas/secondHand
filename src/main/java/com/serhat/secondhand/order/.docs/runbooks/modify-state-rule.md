# Modify Order State Rule

## Purpose
Provides instructions for safely modifying the conditions under which an order transitions from one state to another (e.g., Pending -> Completed).

## When to Load
- When business logic governing order state progression changes.
- When an order state transition bug needs to be fixed.

## When NOT to Load
- When modifying payment logic.
- When adding a new HTTP endpoint to the order controller.

## Assumptions
- Order state transition logic is centralized inside the `Order` entity (Rich Domain Model) or `policy` classes, never scattered across services.

## Procedure
1. First, locate the applicable `policy` classes or `Order` entity methods managing the state transition.
2. Update the condition or rule inside the `policy` or entity.
3. Revise the service orchestration to match the updated policy result if needed.
4. Verify event triggering conditions to ensure they match the new state logic.
5. Align error semantics with `OrderErrorCodes` without breaking backwards compatibility.

## Pitfalls
- Distributing state rules into `application` services instead of `policy`/`entity`.
- Emitting events even if a policy prevents the state transition.

## Related Files
- `src/main/java/com/serhat/secondhand/order/policy/`
- `src/main/java/com/serhat/secondhand/order/entity/Order.java`
