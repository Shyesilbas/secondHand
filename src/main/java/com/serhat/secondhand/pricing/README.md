# Pricing Domain

## Purpose
The `pricing` domain acts as the central Pricing Engine, dynamically calculating final prices by applying active campaigns and valid coupons to a user's cart or checkout context.

## Architecture Overview
- **PriceCalculationEngine:** The orchestrator that applies the pricing rules sequentially (Base Price -> Campaigns -> Coupons).
- **Calculators:** Specialized strategy classes (`CampaignDiscountCalculator`, `CouponDiscountCalculator`) handle specific reduction logic.

## Business Invariants & Constraints
- **Calculation Priority:** Campaign discounts are strictly applied BEFORE global coupon discounts.
- **Category Exclusions:** High-value categories like Real Estate (`REAL_ESTATE`) and Vehicles (`VEHICLE`) are systemically excluded from standard percentage campaigns.

## Integration Points
- **Incoming:** Called primarily by the `checkout` domain during the final cart review.
- **Outgoing:** Queries the `campaign` domain to fetch active seller campaigns.

## Public APIs
- None exposed directly; utilized as an internal service.

## Related Knowledge
- *(No runbooks extracted; modifications involve adjusting the PriceCalculationEngine sequence)*
