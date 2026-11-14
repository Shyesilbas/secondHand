-- Campaign name as shown at checkout, so order history survives a later rename or soft delete of the campaign.
-- NULL when no campaign applied or on rows created before this migration.

ALTER TABLE order_items
    ADD COLUMN IF NOT EXISTS campaign_name VARCHAR(255);
