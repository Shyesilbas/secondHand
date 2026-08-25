-- ─── Add Index for Cart Listing Queries ─────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_cart_listing ON carts (listing_id);
