-- V18: Add category and price_snapshot to listing_views for ML analytics and fast feature extraction
ALTER TABLE listing_views 
ADD COLUMN IF NOT EXISTS category VARCHAR(50),
ADD COLUMN IF NOT EXISTS price_snapshot NUMERIC(19, 2);

CREATE INDEX IF NOT EXISTS idx_listing_view_category ON listing_views (category);

-- Backfill existing rows with current listing_type and price
UPDATE listing_views lv
SET category = l.listing_type,
    price_snapshot = l.price
FROM listings l
WHERE lv.listing_id = l.id
  AND (lv.category IS NULL OR lv.price_snapshot IS NULL);
