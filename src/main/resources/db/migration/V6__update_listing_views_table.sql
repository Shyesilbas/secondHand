-- ─── Fix Listing Views Table ───────────────────────────────────────────────────

ALTER TABLE listing_views ADD COLUMN IF NOT EXISTS user_id BIGINT REFERENCES users(id);
ALTER TABLE listing_views ADD COLUMN IF NOT EXISTS session_id VARCHAR(255);
ALTER TABLE listing_views ADD COLUMN IF NOT EXISTS ip_hash VARCHAR(64);
ALTER TABLE listing_views ADD COLUMN IF NOT EXISTS user_agent VARCHAR(500);

CREATE INDEX IF NOT EXISTS idx_listing_view_listing ON listing_views(listing_id);
CREATE INDEX IF NOT EXISTS idx_listing_view_user ON listing_views(user_id);
CREATE INDEX IF NOT EXISTS idx_listing_view_session ON listing_views(session_id);
CREATE INDEX IF NOT EXISTS idx_listing_view_date ON listing_views(viewed_at);
