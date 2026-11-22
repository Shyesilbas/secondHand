-- Platform coupons are funded by the platform, not by the seller. The buyer pays the net price
-- (escrows.amount, also the refund basis); the coupon share per line is kept so the seller is
-- paid amount + platform_subsidy when the escrow is released.
ALTER TABLE order_items
    ADD COLUMN IF NOT EXISTS coupon_discount NUMERIC(10, 2) NOT NULL DEFAULT 0;

ALTER TABLE escrows
    ADD COLUMN IF NOT EXISTS platform_subsidy NUMERIC(10, 2) NOT NULL DEFAULT 0;

-- Older lines: item prices are already net of the coupon, so the share is what is missing from
-- the post-campaign gross (original price x quantity - campaign discount).
UPDATE order_items
SET coupon_discount = GREATEST(
        original_unit_price * quantity - COALESCE(campaign_discount, 0) - total_price, 0)
WHERE original_unit_price IS NOT NULL
  AND order_id IN (SELECT id FROM orders WHERE coupon_discount > 0);

-- Only escrows still held are corrected; released ones were already paid out.
UPDATE escrows e
SET platform_subsidy = oi.coupon_discount
FROM order_items oi
WHERE e.order_item_id = oi.id
  AND e.status = 'ESCROW'
  AND oi.coupon_discount > 0;
