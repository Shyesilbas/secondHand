## Order service layer

This package contains application services around orders. Payment-related responsibilities are limited to
creating orders and coordinating with the payment module.

### Main responsibilities

- `OrderCreationService`
  - Builds and persists `Order`, `OrderItem` and `Shipping` entities.
  - Uses pricing data (when available) to set totals and discounts on the order.
  - Does not trigger any payment itself.

- `OrderPaymentService`
  - Converts order and cart information into one or more `PaymentRequest` instances.
  - Uses `PaymentProcessor` to execute all payments for an order.
  - Updates the `Order` payment status and method based on payment results.

- `OrderNotificationService`, `OrderEscrowService`, `OrderCompletionService`, `OrderCancellationService`, `OrderRefundService`
  - Handle notifications, escrow lifecycle and order status changes after payment.

### Checkout entry point

- Controller: `order/api/OrderController.checkout`
  - Calls `payment/service/CheckoutService.checkout`.

- `CheckoutService.checkout`
  - Delegates to `payment/service/CheckoutOrchestrator.executeCheckout`, which:
    - Reads cart and offer information.
    - Calls `OrderCreationService.createOrder` to build the order.
    - Calls `OrderPaymentService.processPaymentsForOrder` to run all payments.
    - On success, runs escrow creation and order notifications.

This means checkout logic lives mainly in the payment module, while the order module focuses on
order data and state transitions.

