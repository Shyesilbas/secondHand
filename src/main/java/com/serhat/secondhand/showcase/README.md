# Showcase Domain

## Purpose
The `showcase` domain governs the paid "vitrin" (showcase) features, allowing sellers to boost their listing's visibility for a specific number of days, including extensions, cancellations, and expiration handling.

## Architecture Overview
- **ShowcaseService:** Central logic coordinating duration limits, payment validation, ownership verification, and Redis TTL registration.
- **ShowcaseRedisManagerService:** Manages fast Redis active showcase caching (`v4:listing:showcase:active:{listingId}`) with automatic TTL expiration matching the showcase end date.
- **ShowcaseMapper:** Performs batch enrichment. It fetches favorite statistics and campaign pricing for all listings in a page simultaneously to avoid N+1 queries.
- **ShowcaseScheduler:** Periodically expires showcases that have passed their expiration date via batch `saveAll`.

## Business Invariants & Constraints
- **Validation:** Extensions and cancellations strictly require verification that the requester owns the showcase.
- **Cancellation Policy:** Canceling a showcase removes its visibility but does not automatically process a financial refund (refunds are handled in the backend payment/ewallet flow separately if applicable).
- **Listing Data Constraints:** The showcase domain does not generate standard listing details on its own; it relies on `ListingMapper` integration.

## State Machines
- **Showcase Status:** Active -> Expired / Cancelled.

## Integration Points
- **Incoming:** Payment verification calls during showcase creation. HTTP requests via `ShowcaseController`.
- **Outgoing:** Interacts with `listing` and `favorite` for batch enrichment.

## Public APIs
- `POST /api/v1/showcases`: Creates a showcase for a listing.
- `POST /api/v1/showcases/bulks`: Creates showcases for multiple listings in batch.
- `GET /api/v1/showcases/active`: Paginated active showcases displayed on homepage/discovery feeds.
- `GET /api/v1/showcases/my`: Showcases owned by the authenticated seller.
- `POST /api/v1/showcases/{id}/extend`: Extends duration of an active showcase.
- `POST /api/v1/showcases/{id}/cancel`: Cancels an active showcase before expiration.
- `GET /api/v1/showcases/pricing-config`: Returns daily showcase fees and pricing rules.

## Related Knowledge
- **Modify Showcase Behavior**
  -> `.docs/runbooks/modify-showcase-behavior.md`
