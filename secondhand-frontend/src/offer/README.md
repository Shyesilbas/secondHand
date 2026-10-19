# Offer UI Module

Negotiation management, offer creation, counter-offer dialogs, and tracking cards for incoming and outgoing price negotiations.

## Architecture
- `OffersPage`: Dual-tabbed view organizing user negotiations into "Offers Received" (seller view) and "Offers Made" (buyer view).
- `MakeOfferModal`: Pre-validates proposed prices against listing limits and previous active offers before dispatch.
- `CounterOfferModal`: Enables sellers to propose a revised price point, updating the negotiation chain.
- `OfferTrackingCard`: Standardized card representing offer status, countdown to expiry, and inline action buttons (Accept, Reject, Counter).

## Invariants
- **24-Hour Hold Awareness:** When an offer transitions to `ACCEPTED`, the buyer gains a 24-hour exclusive purchase window (`offer:reservation:{listingId}`); UI highlights an immediate checkout CTA.
- **Price Bounds:** Offers must be strictly lower than listing price and adhere to minimum allowable offer thresholds.
- **Single Active Negotiation:** Submitting a counter-offer invalidates previous pending proposals for that listing item.
