-- Platform system account: receives listing, showcase, membership and shipping fees and commissions,
-- and funds platform coupons. It owns no credentials (the password hash never matches), so nobody can sign in.
INSERT INTO users (email, password, name, surname, gender, plan, account_verified, acc_status, role)
VALUES ('system@secondhand.internal', '!', 'SecondHand', 'System', 'PREFER_NOT_TO_SAY', 'FREE', TRUE, 'ACTIVE', 'USER')
ON CONFLICT (email) DO NOTHING;

-- The balance starts at zero and may go negative while platform coupons are paid out ahead of fees.
INSERT INTO ewallet (user_id, balance, version)
SELECT id, 0, 0 FROM users WHERE email = 'system@secondhand.internal'
ON CONFLICT (user_id) DO NOTHING;

-- Seller commission taken when the escrow is released, fixed when the escrow is held.
ALTER TABLE escrows
    ADD COLUMN IF NOT EXISTS commission_amount NUMERIC(10, 2) NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS commission_rate NUMERIC(5, 2);

-- Flat cargo fee paid by the buyer to the system account; refunded once when the whole order is cancelled.
ALTER TABLE orders
    ADD COLUMN IF NOT EXISTS shipping_fee NUMERIC(10, 2) NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS shipping_fee_refunded BOOLEAN NOT NULL DEFAULT FALSE;
