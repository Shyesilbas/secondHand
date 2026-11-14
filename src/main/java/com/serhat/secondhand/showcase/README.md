# Showcase Domain

Manages paid homepage/discovery listing promotions ("vitrin", `showcases` table), membership slot quotas (`PlanValidator`), synchronous fee capture via `PaymentProcessor`, active Redis TTL tracking (`ShowcaseRedisManagerService`), and scheduled expiration (`ShowcaseScheduler`).

> [!NOTE]
> **Related Documentation & Runbooks:**
> - **Architecture Deep Dive:** [`docs/social-proof-and-urgency-metrics-architecture.md`](/docs/social-proof-and-urgency-metrics-architecture.md)
> - **Frontend Module:** [`secondhand-frontend/src/showcase/README.md`](/secondhand-frontend/src/showcase/README.md)
> - **Key Entry Points:** [`ShowcaseController`](api/ShowcaseController.java) · [`ShowcaseService`](application/ShowcaseService.java) · [`IShowcaseService`](application/IShowcaseService.java) · [`ShowcaseRedisManagerService`](application/ShowcaseRedisManagerService.java) · [`ShowcaseValidator`](validator/ShowcaseValidator.java) · [`ShowcaseScheduler`](ShowcaseScheduler.java) · [`ShowcasePricingCalculator`](application/ShowcasePricingCalculator.java) · [`ShowcaseMapper`](ShowcaseMapper.java)

## Business Rules & Invariants
- **Plan Slot Quota & Validation (`ShowcaseValidator`, `PlanValidator`):** Promotion `days` must be within configured bounds (`SHOWCASE_DAYS_INVALID`), the listing must not already have an active showcase (`SHOWCASE_ALREADY_ACTIVE`), and `countActiveByUserId` must fit the seller's tier quota (`BASIC`, `PLUS`, `PRO` via `PlanValidator.checkShowcaseSlot`, `SHOWCASE_SLOT_LIMIT_EXCEEDED`).
- **Synchronous Fee Capture:** `ShowcasePricingCalculator` is the only price source (daily cost plus rounded tax, times `days`); the charge, the quotes and the OTP e-mail all use it. `ShowcaseService` charges via `PaymentProcessor` before persisting the `Showcase` row in `ShowcaseStatus.ACTIVE`.
- **Change rule:** `ShowcasePricingCalculator` depends on configuration only; `PaymentVerificationMessageBuilder` uses it, so giving it payment dependencies creates a bean cycle.
- **Extensions, Early Cancellation & Expiration:**
  - `extend`: verifies ownership (`SHOWCASE_NOT_OWNED`) and `ACTIVE` status, charges incremental days, extends `endDate`, and refreshes the Redis TTL.
  - `cancel`: marks the row `ShowcaseStatus.CANCELLED` and removes the Redis key immediately (no automated refund).
  - `ShowcaseScheduler` (`showcaseConfig.scheduler.expireCron`): bulk-transitions overdue `ACTIVE` rows (`endDate <= now`) to `EXPIRED` and prunes Redis keys.
- **Change rule:** Expiration scheduler uses `saveAll`; `ShowcaseMapper` enriches in batches; `/active` stays paginated.

## Redis
- `v4:listing:showcase:active:{listingId}` (String storing `showcaseId`, TTL set to remaining seconds until `endDate`) — allows fast showcase badge lookup without hitting PostgreSQL.

## API (`ShowcaseController`, `/api/v1/showcases`)
- `POST /` — create a showcase for one listing (`ShowcaseDto`). There is no batch endpoint; a bulk purchase needs one payment, a server-side discount and all-or-nothing rollback before it is added.
- `GET /active` & `GET /my` — paginated homepage showcase feed and current seller's showcases.
- `POST /{id}/extend` & `POST /{id}/cancel` — extend duration or cancel early.
- `GET /quotes?days=` — server-priced cost, tax and eWallet balance check per requested duration (`ShowcaseQuoteDto` list).
- `GET /pricing-config` — daily fee, tax rate, and duration config (`ShowcasePricingDto`).
