# Pricing Domain

## Purpose
The `pricing` domain acts as the central Pricing Engine, dynamically calculating final prices by applying active campaigns and valid coupons to a user's cart or checkout context.

## Architecture Overview
- **PriceCalculationEngine:** The orchestrator that applies the pricing rules sequentially (Base Price -> Campaigns -> Coupons).
- **Calculators:** `CampaignDiscountCalculator` and `CouponDiscountCalculator` are not called anywhere; the engine holds its own copy of this logic. Change the engine.
- Deep dive: `docs/pricing-coupon-and-campaign-architecture.md`.

## Business Invariants & Constraints
- **Calculation Priority:** Campaign discounts are strictly applied BEFORE global coupon discounts.
- **Category Exclusions:** Real Estate (`REAL_ESTATE`) and Vehicles (`VEHICLE`) are excluded from every campaign and coupon.

## Integration Points
- **Incoming:** Called primarily by the `checkout` domain during the final cart review.
- **Outgoing:** Queries the `campaign` domain to fetch active seller campaigns.

## Public APIs
- None exposed directly; utilized as an internal service.
