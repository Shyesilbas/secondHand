-- Snapshot of the coupon discount a checkout received, so "total savings" does not depend on order paging.
ALTER TABLE coupon_redemptions
    ADD COLUMN IF NOT EXISTS discount_amount NUMERIC(19, 2) NOT NULL DEFAULT 0;

-- Older redemptions: the discount recorded on the order the coupon was linked to.
UPDATE coupon_redemptions r
SET discount_amount = COALESCE(o.coupon_discount, 0)
FROM orders o
WHERE r.order_id = o.id
  AND r.discount_amount = 0;
