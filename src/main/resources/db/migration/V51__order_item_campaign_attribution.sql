-- Seller campaign attribution per order line, captured at checkout from the priced cart.
-- NULL on rows created before this migration means "not recorded", not "no campaign".
-- campaign_id has no foreign key: the line keeps its snapshot even if the campaign row is removed.

ALTER TABLE order_items
    ADD COLUMN IF NOT EXISTS campaign_id UUID,
    ADD COLUMN IF NOT EXISTS original_unit_price NUMERIC(10, 2),
    ADD COLUMN IF NOT EXISTS campaign_discount NUMERIC(10, 2);

CREATE INDEX IF NOT EXISTS idx_order_item_campaign
    ON order_items (campaign_id)
    WHERE campaign_id IS NOT NULL;
