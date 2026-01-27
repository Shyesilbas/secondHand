## Payment service layer

This package contains the main application services for payments and checkout.

### High-level flows

#### 1. Cart checkout (buyer purchases items)

Call chain:

- `order/api/OrderController.checkout`
  - calls `payment/service/CheckoutService.checkout`
    - calls `payment/service/CheckoutOrchestrator.executeCheckout`

Inside `CheckoutOrchestrator.executeCheckout`:

1. Load user and cart items.
2. Resolve accepted offer (if any) and build effective cart.
3. Calculate pricing with `PricingService`.
4. Reserve stock using `ListingRepository` with locks.
5. Create `Order` with `OrderCreationService.createOrder`.
6. Process all payments for that order via `OrderPaymentService.processOrderPayments`.
7. On success, create escrows and send notifications.

#### 2. Order level payment processing (multiple payments per order)

Class: `OrderPaymentService`

- Builds `PaymentRequest` list from domain data using `OrderPaymentMapper` and `PaymentRequestMapper`.
- For each request:
  - Uses `PaymentProcessor.executeSinglePayment(userId, paymentRequest)`.
- Updates `Order` payment status and method after all payments complete.

#### 3. Single payment execution

Class: `PaymentProcessor`

Responsibilities:

1. Ensure idempotency:
   - Uses `PaymentIdempotencyHelper.buildIdempotencyKey` when request has no key.
   - Wraps the original `PaymentRequest` with that key using `withIdempotencyKey`.
2. Execute in a new transaction:
   - Look for an existing `Payment` with same idempotency key and fromUser; if found, validate parameters and return existing result.
   - Otherwise run pre-checks via `PaymentPreCheckService.preCheck`.
   - Select a `PaymentStrategy` from `PaymentStrategyFactory`.
   - Call `strategy.process(...)` to perform the concrete payment logic.
   - Persist the new `Payment` and publish a `PaymentCompletedEvent` when successful.

#### 4. Pre-checks before money movement

Class: `PaymentPreCheckService`

Steps:

1. Load `fromUser` using `UserService`.
2. Resolve `toUser` from `PaymentRequest` via `PaymentValidationHelper.resolveToUser`.
3. Validate that agreements are accepted with `PaymentValidator.validatePaymentAgreements`.
4. Validate or generate verification code with `IPaymentVerificationService.validateOrGenerateVerification`.
5. Validate amount, payment type and self-payment rules via `PaymentValidationHelper.validatePaymentRequest`.
6. Return a `PaymentPreCheckContext` that bundles `fromUser` and `toUser` for the processor.

### Other services

- `CheckoutService`
  - Thin wrapper used by controllers; delegates to `CheckoutOrchestrator`.

- `PaymentVerificationService`
  - Manages payment verification codes (generation, validation and notifications).
  - Only exposes verification-related methods through `IPaymentVerificationService`.

- `ListingFeeService`
  - Calculates listing creation fee (using `ListingConfig`) and pays it via `PaymentProcessor`.

- `PaymentStatsService`
  - Read-only reporting and paging over `Payment` data, enriched with listing information.

