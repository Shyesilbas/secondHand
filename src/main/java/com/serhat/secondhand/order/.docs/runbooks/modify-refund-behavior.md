# Modify Order Refund or Cancellation Behavior

## Purpose
Instructions for altering how order items are refunded or cancelled, and how the compensation plan interacts with the payment orchestrator.

## When to Load
- When altering rules for full or partial order cancellations.
- When changing the `OrderItemCompensationPlanner`.

## When NOT to Load
- When fixing an issue with order creation.
- When the bug is purely in the UI display of order status.

## Assumptions
- Cancellation and refund must be planned item-by-item (`OrderItemCompensationPlanner`).
- Actual fund transfers are delegated to the `payment` orchestrator; `order` only makes the domain decision.

## Procedure
1. Identify whether the change impacts `OrderCancellationService` or `OrderRefundService`.
2. Update the `OrderItemCompensationPlanner` logic to correctly partition items to be refunded vs items to keep.
3. Validate the `payment` orchestrator call semantics (ensure partial refunds pass the correct amounts/items).
4. Review the persistence steps to ensure the domain state matches the orchestrator response.
5. Verify the event and notification chain (e.g., `OrderRefundedEvent`).

## Pitfalls
- Handling para/fund logic inside the `order` package instead of delegating to `payment`.
- Inconsistent partial failure handling (e.g., payment succeeds but order status rollback fails).

## Related Files
- `src/main/java/com/serhat/secondhand/order/application/OrderCancellationService.java`
- `src/main/java/com/serhat/secondhand/order/application/OrderRefundService.java`
