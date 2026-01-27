## Payment module overview

This module is responsible for all money movement and payment-related concerns. The main ideas:

- All external payment flows should eventually go through a single core processor.
- Order creation lives in the `order` module; payment lives here and is orchestrated from there.
- Verification, idempotency, validation and payment strategies are separated into focused components.

### Key entry points

- `service/CheckoutService`
  - Public entry point for checkout from HTTP (`OrderController` calls this).
  - Delegates to `service/CheckoutOrchestrator`.

- `service/ListingFeeService`
  - Public entry point for listing creation fee payments.
  - Builds a `PaymentRequest` and delegates to `service/PaymentProcessor`.

- `service/PaymentStatsService`
  - Read-only payment statistics and listing-related payment history.

### Core processing pipeline

1. A higher-level service (for example `CheckoutOrchestrator` or `ListingFeeService`) builds one or more `PaymentRequest` instances.
2. These requests are sent to `service/OrderPaymentService` (for checkout) or directly to `service/PaymentProcessor`.
3. `PaymentProcessor`:
   - Ensures every request has a stable idempotency key (using `util/PaymentIdempotencyHelper`).
   - Runs all validations and verification via `service/PaymentPreCheckService`.
   - Selects a `PaymentStrategy` via `strategy/PaymentStrategyFactory`.
   - Executes the strategy, persists a `Payment` entity and publishes domain events.

The goal is that when you want to understand or change how a payment is executed you only need to open:

- `PaymentProcessor` for core flow,
- `PaymentPreCheckService` for validation logic,
- `PaymentIdempotencyHelper` for idempotency behaviour,
- and the relevant `PaymentStrategy` implementation for concrete money movement.

