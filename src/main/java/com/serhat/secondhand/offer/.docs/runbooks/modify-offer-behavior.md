# Modify Offer Behavior

## Purpose
Provides execution steps for modifying the offer lifecycle, including accepting, rejecting, countering, and expiration handling.

## When to Load
- When changing how offers transition between states.
- When adding new data fields to an offer.
- When fixing bugs in the Offer Scheduler.

## When NOT to Load
- When modifying the listing pricing model.
- When debugging simple query syntax errors.

## Assumptions
- The `accept` flow has concurrency risks and must acquire a lock on the Listing.
- Offers form a chain (parent -> child) in counter-offer scenarios.

## Procedure

### Modifying Behavior
1. Apply the new business rule in `OfferValidator` or `OfferService`.
2. Ensure error codes map correctly via `OfferErrorCodes`.

### Adding Fields
1. Update `Offer` entity, `CreateOfferRequest`, `OfferDto`, and `OfferMapper`.
2. Update validaton rules if needed.

### Concurrency
1. In `accept`, always acquire `findByIdWithLock` on the Listing and verify no other offer was accepted in the meantime.

## Pitfalls
- Ignoring pagination or `EntityGraph` hints when fetching list queries, causing N+1 memory issues.
- Using magic numbers instead of `OfferConfigProperties`.

## Related Files
- `src/main/java/com/serhat/secondhand/offer/application/OfferService.java`
- `src/main/java/com/serhat/secondhand/offer/validator/OfferValidator.java`
