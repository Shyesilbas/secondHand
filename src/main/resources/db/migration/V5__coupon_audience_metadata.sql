-- Coupon display + audience: all users vs explicit user whitelist
ALTER TABLE coupons
    ADD COLUMN IF NOT EXISTS title VARCHAR(255),
    ADD COLUMN IF NOT EXISTS description TEXT,
    ADD COLUMN IF NOT EXISTS for_all_users BOOLEAN NOT NULL DEFAULT TRUE;

CREATE TABLE IF NOT EXISTS coupon_eligible_users (
    coupon_id UUID NOT NULL REFERENCES coupons (id) ON DELETE CASCADE,
    user_id BIGINT NOT NULL,
    PRIMARY KEY (coupon_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_coupon_eligible_users_user_id ON coupon_eligible_users (user_id);
