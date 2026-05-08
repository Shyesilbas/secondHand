ALTER TABLE campaigns
    ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP;

CREATE INDEX IF NOT EXISTS idx_campaigns_deleted_at ON campaigns (deleted_at);

ALTER TABLE seller_follows
    ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP;

CREATE INDEX IF NOT EXISTS idx_seller_follows_deleted_at ON seller_follows (deleted_at);
