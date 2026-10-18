# Add or Modify Payment Provider

## Purpose
Instructions for adding a new payment method or changing pre-check / provider logic in the `payment` domain. Background: `docs/payment-strategy-and-provider-extension-guide.md`.

## When to Load
- When implementing a new payment provider.
- When modifying `PaymentPreCheckService` or an existing `PaymentProviderPort` adapter.

## When NOT to Load
- When fixing an Escrow timeout bug.
- When adding a post-payment event handler (see `add-event-handler.md`).

## Assumptions
- Providers implement `PaymentProviderPort` (`supports`, `canProcess`, `process`) and are Spring beans; `PaymentProcessor` picks the one whose `supports(providerName)` matches. Today only `EWalletPaymentProviderAdapter` (`EWALLET`) exists.
- Idempotency, verification and outbox writing are handled by `PaymentProcessor`, not the provider.

## Procedure
1. Decide whether the change belongs in `PaymentPreCheckService` (before the provider) or inside the provider adapter.
2. New provider: create an adapter `@Component` implementing `PaymentProviderPort` (in the module that owns the money, like `ewallet/adapter/in`); no registry change is needed.
3. Update `PaymentType` and transaction type enums if necessary.
4. Align error semantics with `PaymentErrorCodes`.
5. Update request / validator / mapper objects together.
6. If the provider needs OTP/verification, define it explicitly in the pre-check.

## Pitfalls
- Leaking idempotency or outbox logic into the provider.
- Forgetting `PaymentErrorCodes` alignment.
- Making `supports()` match more than one provider name.

## Related Files
- `src/main/java/com/serhat/secondhand/payment/port/out/PaymentProviderPort.java`
- `src/main/java/com/serhat/secondhand/payment/application/PaymentProcessor.java`
- `src/main/java/com/serhat/secondhand/payment/application/PaymentPreCheckService.java`
- `src/main/java/com/serhat/secondhand/ewallet/adapter/in/EWalletPaymentProviderAdapter.java`
