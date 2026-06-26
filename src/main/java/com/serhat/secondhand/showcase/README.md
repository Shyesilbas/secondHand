# Showcase Domain

## Purpose
The `showcase` domain governs the paid "vitrin" (showcase) features, allowing sellers to boost their listing's visibility for a specific number of days, including extensions, cancellations, and expiration handling.

## Architecture Overview
- **ShowcaseService:** Central logic coordinating duration limits, payment validation, and ownership verification.
- **ShowcaseMapper:** Performs batch enrichment. It fetches favorite statistics and campaign pricing for all listings in a page simultaneously to avoid N+1 queries.
- **ShowcaseScheduler:** Periodically expires showcases that have passed their expiration date via batch `saveAll`.

## Business Invariants & Constraints
- **Validation:** Extensions and cancellations strictly require verification that the requester owns the showcase.
- **Cancellation Policy:** Canceling a showcase removes its visibility but does not automatically process a financial refund (refunds are handled in the backend payment/ewallet flow separately if applicable).
- **Listing Data Constraints:** The showcase domain does not generate standard listing details on its own; it relies on `ListingMapper` integration.

## State Machines
- **Showcase Status:** Active -> Expired / Cancelled.

## Integration Points
- **Incoming:** Payment verification calls during showcase creation.
- **Outgoing:** Interacts with `listing` and `favorite` for batch enrichment.

## Public APIs
- `/api/showcases` (Create, Extend, Cancel, List Active, List My).

## Related Knowledge
- **Modify Showcase Behavior**
  -> `.docs/runbooks/modify-showcase-behavior.md`
