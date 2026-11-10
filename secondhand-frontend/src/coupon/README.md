# Coupons UI Module

Platform-wide discount coupons, vouchers, user participation tracking, and discount formatting.

## Architecture

- **`PlatformCouponsPage`:** User-facing coupons directory (`/coupons`) organizing vouchers into active eligible coupons (`active`) and already used/participated vouchers (`participated`).
- **`couponUiFormat.js`:** Utility functions formatting coupon discount figures (order percent, fixed amounts, threshold bonuses) and validity date ranges.
- **Service Integration:** Queries `couponService.active()` (`['coupons', 'active-for-me']`) to display vouchers tailored to the current authenticated user's eligibility and order history.

## Invariants

- **Accurate Quota Display:** Coupons render remaining global and per-user usage limits using tabular figures (`tabular-nums`).
- **Design Alignment:** Complies with `.agents/skills/restrained-ui-design-standard/SKILL.md`: coupon codes are presented with copy-to-clipboard actions, subtle border dashes, and zero celebratory emojis.

