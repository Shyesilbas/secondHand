CREATE INDEX IF NOT EXISTS idx_listing_title_lower 
ON listings (LOWER(title));
