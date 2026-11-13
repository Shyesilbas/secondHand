# Offer UI Module

> [!NOTE]
> **Backend Counterpart & Architecture Deep Dive:**
> - **Backend Module:** [`offer`](../../../src/main/java/com/serhat/secondhand/offer/README.md)
> - **Architecture Deep Dive:** [`docs/offer-system-and-concurrency-locks.md`](../../../docs/offer-system-and-concurrency-locks.md)
> - **Architecture Deep Dive:** [`docs/websocket-stomp-and-chat-architecture.md`](../../../docs/websocket-stomp-and-chat-architecture.md)

## 1. Executive Summary & Route Map

| Path | Page | Access |
|---|---|---|
| `/offers` | `OffersPage` | Protected |

## 2. React Query Keys

Generated from code; the hook files are the source of truth.

| Query key | Defined in |
|---|---|
| `['offers', 'made', madePage, size]` | `OffersPage.jsx` |
| `['offers', 'received', receivedPage, size]` | `OffersPage.jsx` |

| Invalidated / updated key | By |
|---|---|
| `['offers']` | `OffersPage.jsx` |

## 3. Business Invariants & Lifecycle Rules

### The 24-Hour Purchase Lock
- When the seller accepts, the backend holds the offer quantity for the buyer until the payment deadline (`app.offer.accepted-payment-hours`); accept fails if the stock is gone.
- The buyer sees a primary "Buy at Accepted Price" button navigating directly to `/checkout?offerId={id}`.
- Third-party buyers viewing the listing detail page are blocked from buying or making competing offers during this 24-hour hold.

### Price Boundaries & Counter-Offer Rules
- An offer cannot exceed the current listing price.
- An offer cannot be negative or zero.
- Counter-offers cannot equal the existing offered price.
