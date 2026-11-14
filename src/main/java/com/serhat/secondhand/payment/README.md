# Payment Domain

Executes payments through pluggable providers, guards against double charges with Redis idempotency, persists the payment ledger and publishes `payment.completed.v1` through a transactional outbox. Side effects (order status, escrow, notifications) run in Kafka handlers.

> [!NOTE]
> **Related Documentation & Runbooks:**
> - **Architecture Deep Dive:** [`docs/payment-strategy-and-provider-extension-guide.md`](/docs/payment-strategy-and-provider-extension-guide.md) (end-to-end flow, claim results, error codes, provider checklist)
> - **Frontend Module:** [`secondhand-frontend/src/payments/README.md`](/secondhand-frontend/src/payments/README.md)
> - **Task Runbook:** [`add-payment-provider.md`](.docs/runbooks/add-payment-provider.md)
> - **Key Entry Points:** [`PaymentProcessor`](application/PaymentProcessor.java) · [`PaymentPreCheckService`](application/PaymentPreCheckService.java) · [`OrderPaymentService`](application/OrderPaymentService.java) · [`PaymentProviderPort`](port/out/PaymentProviderPort.java) · [`PaymentRedisIdempotencyService`](util/PaymentRedisIdempotencyService.java) · [`PaymentOutboxWorker`](outbox/PaymentOutboxWorker.java) · [`PaymentCompletedKafkaConsumer`](application/PaymentCompletedKafkaConsumer.java)

## Business Rules & Invariants
- **Idempotency lives in `PaymentProcessor`, not in adapters.** `PaymentRedisIdempotencyService.claim` takes `v4:payment:idempotency:{key}` with `SET NX`; value is `PENDING:{fingerprint}` then `DONE:{fingerprint}`. TTLs: `PaymentProcessingConstants.IDEMPOTENCY_LOCK_TTL_HOURS` / `IDEMPOTENCY_RESULT_TTL_HOURS`.
- **Pre-check before any transfer** (`PaymentPreCheckService`): active account, accepted agreements, OTP when required (`POST /initiate-verification`).
- **Order link:** `payment.order_id` holds `Order.externalId` (UUID), never `orders.id`; FK `fk_payment_order_external_id`. Purchases and refunds set it plus `order_item_id` (refunds via `WalletTransactionReference`); non-order payments leave both null.
- **Ledger row and outbox row commit in the same transaction** (`payments` + `payment_outbox_events`). The API never waits for side effects.
- **Item purchases pay into platform escrow**, never directly to the seller.
- **Handlers are selected by `PaymentTransactionType`** via `PaymentCompletedHandlerRegistry`: `ItemPurchasePaymentCompletedHandler`, `ListingCreationPaymentCompletedHandler`, `DefaultPaymentCompletedHandler` (fallback).
- **No generic pay endpoint:** payments are created only by server-priced flows (checkout, listing fee, showcase, membership); `PaymentRequest` is never a request body.
- New providers implement `PaymentProviderPort` only; they inherit idempotency, outbox and pre-checks automatically.
- **Change rule:** Post-payment side effects are `PaymentCompletedHandler` beans with a narrow `supports` condition and an explicit `@Order`; they run after commit and never change payment state.

## Redis, Outbox & Kafka
- Idempotency key: see above. Spring cache `payment:stats` (`PaymentStatsService`), evicted by `PaymentProcessor` on every payment; TTL in `CacheConfig`.
- Outbox: `payment_outbox_events`, polled by `PaymentOutboxWorker` (`app.payment.outbox.fixed-delay-ms`).
- Topic: `payment.completed.v1` (`PaymentCompletedKafkaEvent`).

## API (`PaymentController`, `/api/v1/payments`)
- `POST /initiate-verification` — send OTP; returns `PaymentVerificationDto` (`expiresAt`). The request carries no amount; the e-mail shows the backend price for the transaction type.
- `GET /my` — paginated ledger, filters `direction`, `status`, `transactionType`.
- `GET /statistics` — `PaymentStatisticsDto` (spent / received / escrow totals), optional `providerName`.
