# Offer Domain

Manages buyer-seller price negotiations (`offers` table), counter-offer chains, one accepted offer per listing (DB-enforced) and scheduled expiration of pending offers (`OfferScheduler`).

> [!NOTE]
> **Related Documentation & Runbooks:**
> - **Architecture Deep Dive:** [`docs/offer-system-and-concurrency-locks.md`](/docs/offer-system-and-concurrency-locks.md) (state machine, accept sequence and stock hold, counter-offer chain)
> - **Architecture Deep Dive:** [`docs/websocket-stomp-and-chat-architecture.md`](/docs/websocket-stomp-and-chat-architecture.md)
> - **Frontend Module:** [`secondhand-frontend/src/offer/README.md`](/secondhand-frontend/src/offer/README.md)
> - **Key Entry Points:** [`OfferController`](api/OfferController.java) · [`OfferService`](application/OfferService.java) · [`IOfferService`](application/IOfferService.java) · [`OfferValidator`](validator/OfferValidator.java) · [`OfferStockHoldService`](application/OfferStockHoldService.java) · [`OfferEmailNotificationService`](email/OfferEmailNotificationService.java)

## Business Rules & Invariants
- **Create (`OfferValidator`):** no self-offers (`OFFER_SELF_NOT_ALLOWED`); listing `ListingStatus.ACTIVE` with stock `>= quantity`. Starts `OfferStatus.PENDING`.
- **Immutable Counter-Offer Chain (`counter`):** Countering marks the parent offer `OfferStatus.REJECTED` and inserts a child `Offer` linked via `parent_offer_id` with the inverted actor (`BUYER` <-> `SELLER`).
- **Single Accepted Offer Under Listing Row Lock (`accept`):**
  1. Acquires a PostgreSQL write lock on the listing (`listingService.findByIdWithLock(listingId)`).
  2. Verifies no other `OfferStatus.ACCEPTED` row exists for the listing (`OFFER_ALREADY_ACCEPTED_FOR_LISTING`).
  3. Holds the offer quantity for the buyer (`OfferStockHoldService.hold`, see Redis); if the hold is refused the offer stays `PENDING` and the error (`INVENTORY_INSUFFICIENT_STOCK` or `OFFER_STOCK_HOLD_FAILED`) is returned.
  4. Transitions the offer to `ACCEPTED`. The hold is released on rollback or on a `OFFER_CONCURRENT_MODIFICATION` save conflict.
- **Accepted offers hold their stock:** other buyers' checkouts see the reduced Redis stock until the offer is paid or expires. The offer checkout reuses the hold (no extra reservation) and `CheckoutOrchestrator` keeps it on a failed checkout so the buyer can retry.
- **Checkout with `offerId`:** `getAcceptedOfferForCheckout` re-locks and re-checks the listing; `OfferPriceHandler` applies the agreed price (no seller campaigns); `markCompleted` is a conditional `UPDATE` to `COMPLETED` (`OFFER_CONCURRENT_MODIFICATION` on a race).
- **Two deadlines in `expiresAt`:** response deadline while `PENDING` (`app.offer.expiration-hours`), then payment deadline from `accept` (`app.offer.accepted-payment-hours`, `calculatePaymentDeadline`). Both statuses are `OfferStatus.EXPIRABLE`; past the deadline actions and offer checkout return `OFFER_EXPIRED`.
- **Expiration (`OfferScheduler`):** conditional `expireIfOverdue` (id + version + status) per overdue offer, so one completed by a concurrent checkout is skipped and not notified. Expiring an `ACCEPTED` offer (scheduler or on-access) releases its hold after commit.
- **Change rule:** deadlines and limits come from `OfferConfigProperties`.

## Redis
- No own keys. The stock hold is the buyer's inventory reservation `v4:inventory:reservation:{userId}:{listingId}` (via `InventoryRedisReservationService.reserveStockWithTtl`), with TTL = time left to the payment deadline, so the reconciliation job counts it like any checkout reservation.
- Known limits: expiry cancels the buyer's whole reservation on that listing; a failed release comes back at the TTL.

## API (`OfferController`, `/api/v1/offers`)
- `POST /` — create offer (`CreateOfferRequest`).
- `GET /{id}` — offer details (buyer or seller only).
- `POST /{id}/accept` · `POST /{id}/reject` · `POST /{id}/counter` (`CounterOfferRequest`).
- `GET /made` & `GET /received` — paginated offers made or received by the authenticated user.
