-- ─── Add missing columns to escrows table ────────────────────────────────────────

ALTER TABLE escrows DROP CONSTRAINT IF EXISTS escrows_order_id_key;

ALTER TABLE escrows ADD COLUMN IF NOT EXISTS order_item_id BIGINT UNIQUE REFERENCES order_items(id);
ALTER TABLE escrows ADD COLUMN IF NOT EXISTS listing_title VARCHAR(255);
ALTER TABLE escrows ADD COLUMN IF NOT EXISTS listing_no VARCHAR(50);
ALTER TABLE escrows ADD COLUMN IF NOT EXISTS listing_id UUID;
ALTER TABLE escrows ADD COLUMN IF NOT EXISTS blocked_at TIMESTAMP;
ALTER TABLE escrows ADD COLUMN IF NOT EXISTS released_at TIMESTAMP;
ALTER TABLE escrows ADD COLUMN IF NOT EXISTS refunded_at TIMESTAMP;
