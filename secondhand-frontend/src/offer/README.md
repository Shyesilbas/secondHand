# Offer UI Module

> [!NOTE]
> **Backend Counterpart & Architecture Deep Dive:**
> - **Backend Module:** [`offer`](../../../src/main/java/com/serhat/secondhand/offer/README.md)
> - **Architecture Deep Dive:** [`docs/offer-system-and-concurrency-locks.md`](../../../docs/offer-system-and-concurrency-locks.md)
> - **Architecture Deep Dive:** [`docs/websocket-stomp-and-chat-architecture.md`](../../../docs/websocket-stomp-and-chat-architecture.md)

## 1. Executive Summary & Route Map
The `offer` module manages real-time price bargaining between buyers and sellers, counter-offer negotiations, offer expiration tracking, and one-click transition to checkout for accepted proposals.

### Route Map
| Route Path | Component | Access | Lazy Loaded | Purpose |
|---|---|---|---|---|
| `/offers` | `OffersPage` | `Protected` | Yes | Tabbed negotiation hub (Sent vs. Received offers) |

---

## 2. Component Hierarchy & File Structure

```
src/offer/
├── pages/
│   └── OffersPage.jsx                  # Tabbed offer manager (Made vs. Received offers)
├── components/
│   ├── OfferTrackingCard.jsx           # Offer card with status pill, price diff, action buttons
│   ├── MakeOfferModal.jsx              # Modal capturing buyer proposed price and note
│   └── CounterOfferModal.jsx           # Modal capturing counter-price from seller or buyer
├── hooks/                              # Integration hooks embedded in OffersPage and buy-boxes
├── services/
│   └── offerService.js                 # Raw Axios endpoints (/api/v1/offers/**)
├── utils/
│   └── offerError.js                   # Maps offer-specific backend error codes to safe strings
├── offerConstants.js                   # Offer statuses, tabs, pagination defaults
└── README.md                           # Module documentation
```

---

## 3. React Query 5 Data Flow & Query Key Invalidation Matrix

### Query Key Topology
- `['offers', 'made', page, size]`: Outgoing offers sent by the authenticated buyer.
- `['offers', 'received', page, size]`: Incoming offers received by the seller.
- `['offers', 'listing', listingId]`: Active offer state for a specific listing in buy-box views.

### Invalidation Matrix
| Mutation Hook | Endpoint | Invalidated Query Keys | UX Impact |
|---|---|---|---|
| `makeOffer` | `POST /api/v1/offers` | `['offers']`, `['listings', 'detail', id]` | Adds offer to Made tab; disables repeat offers |
| `acceptOffer` | `POST /api/v1/offers/{id}/accept` | `['offers']` | Transitions status to `ACCEPTED`; triggers 24h lock |
| `rejectOffer` | `POST /api/v1/offers/{id}/reject` | `['offers']` | Marks offer rejected |
| `counterOffer` | `POST /api/v1/offers/{id}/counter` | `['offers']` | Updates chain with new counter-price |
| `cancelOffer` | `POST /api/v1/offers/{id}/cancel` | `['offers']` | Buyer withdraws proposal |

---

## 4. 4-State UX Handling Discipline

1. **Loading State:**
   - `OffersPage` renders `<SkeletonList count={3} />` replicating the card layout.
2. **Empty State:**
   - Made Tab Empty: Renders `<EmptyState>` with a handshake icon: "You have not made any offers yet."
   - Received Tab Empty: "No offers received for your listings yet."
3. **Error State:**
   - Displays inline `<Alert variant="error">` banners inside modals using `getOfferErrorMessage(err)`.
4. **Disabled / Submitting State:**
   - Action buttons ("Accept", "Reject", "Counter") are disabled and show loading spinners during active mutations.

---

## 5. Business Invariants & Lifecycle Rules

### 5.1 The 24-Hour Purchase Lock
- When an offer is accepted by the seller, backend creates an exclusive Redis hold (`v4:offer:lock:{listingId}`) for 24 hours.
- The buyer sees a primary "Buy at Accepted Price" button navigating directly to `/checkout?offerId={id}`.
- Third-party buyers viewing the listing detail page are blocked from buying or making competing offers during this 24-hour hold.

### 5.2 Price Boundaries & Counter-Offer Rules
- An offer cannot exceed the current listing price.
- An offer cannot be negative or zero.
- Counter-offers cannot equal the existing offered price.

---

## 6. Backend Contract & Safe Error Handling
- Exceptions are unwrapped via `getOfferErrorMessage(err)`:
  - `OFFER_NOT_FOUND` -> "The offer could not be found or has expired."
  - `OFFER_ALREADY_ACCEPTED` -> "This offer has already been accepted."
  - `OFFER_BUYER_LOCK_ACTIVE` -> "This item is temporarily reserved for another buyer's accepted offer."

---

## 7. Restrained Design Tokens & Anti-Patterns
- **Numerical Formatting:** Original price, offer price, and percentage difference (`-15%`) use `font-mono tabular-nums`.
- **Zero Emojis:** Strictly prohibited across offer cards, status badges, and modal dialogs.
- **Radius Ceiling:** Cards, modals, and buttons adhere strictly to `rounded-md`.
