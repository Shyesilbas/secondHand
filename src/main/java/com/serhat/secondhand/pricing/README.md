# Pricing Domain

Stateless calculation service (`PricingService` + pure `PriceCalculationEngine`) that resolves accepted offer overrides, selects the best seller campaign per line item, validates platform coupons, and apportions discounts across sellers.

> [!NOTE]
> **Related Documentation & Runbooks:**
> - **Architecture Deep Dive:** [`docs/pricing-coupon-and-campaign-architecture.md`](/docs/pricing-coupon-and-campaign-architecture.md) (order of operations, proportional multi-seller formula, rounding adjustment)
> - **Architecture Deep Dive:** [`docs/checkout-pipeline-and-distributed-transaction-flow.md`](/docs/checkout-pipeline-and-distributed-transaction-flow.md)
> - **Frontend Module:** [`secondhand-frontend/src/cart/README.md`](/secondhand-frontend/src/cart/README.md)
> - **Key Entry Points:** [`IPricingService`](application/IPricingService.java) · [`PricingService`](application/PricingService.java) · [`PriceCalculationEngine`](engine/PriceCalculationEngine.java) · [`OfferPriceHandler`](handler/OfferPriceHandler.java) · [`PricingMapper`](mapper/PricingMapper.java)

## Business Rules & Invariants
- **Single Pure Engine:** All price math runs in `PriceCalculationEngine` (no I/O, scaled to 2 decimals with `RoundingMode.HALF_UP` via `PricingUtil.scale`). `pricing/calculator/*` is unused legacy code — do not extend it.
- **Deterministic Order of Operations:**
  1. **Offer Override (`OfferPriceHandler`):** If an accepted offer is supplied, its negotiated quantity and total price apply only to that listing's line (`isOfferLine`), and that line is immune to seller campaigns.
  2. **Best Single Seller Campaign:** For each remaining eligible line, batch-loaded seller campaigns (`loadActiveCampaignsForSellers`) are evaluated (`minQuantity`, `PERCENTAGE` vs `FIXED_AMOUNT`), selecting the single campaign yielding the highest savings (no campaign stacking).
  3. **Platform Coupon on Post-Campaign Subtotal:** Coupon eligibility and `minSubtotal` are checked against `subtotalAfterCampaigns`. Discounts are allocated across sellers proportionally to each seller's share of `subtotalAfterCampaigns` (penny rounding discrepancy adjusted on the largest seller order).
- **Vertical Exclusion:** `ListingType.REAL_ESTATE` and `ListingType.VEHICLE` never receive seller campaigns or platform coupons.
- **Preview vs. Checkout Split (`IPricingService`):**
  - `priceCart` (cart preview): silently drops an invalid/ineligible coupon and returns the post-campaign price.
  - `priceCartForCheckout` (checkout & payment verification): fails fast with `Result.error(CouponErrorCodes...)` if a provided coupon cannot be applied.
- **Non-Negative Floor:** Line totals, seller subtotals, and `payableTotal` are clamped to `>= 0.00` (`PricingResultDto`).
