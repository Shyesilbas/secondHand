-- ─── Update ewallet table ────────────────────────────────────────────────────────

ALTER TABLE ewallet ADD COLUMN IF NOT EXISTS wallet_limit DECIMAL(19, 2);
ALTER TABLE ewallet ADD COLUMN IF NOT EXISTS spending_warning_limit DECIMAL(19, 2);
ALTER TABLE ewallet ADD COLUMN IF NOT EXISTS version BIGINT DEFAULT 0;

-- ─── Update payment table ────────────────────────────────────────────────────────

ALTER TABLE payment ADD COLUMN IF NOT EXISTS version BIGINT DEFAULT 0;
ALTER TABLE payment ADD COLUMN IF NOT EXISTS currency VARCHAR(10) DEFAULT 'TRY';
ALTER TABLE payment ADD COLUMN IF NOT EXISTS listing_id UUID;
ALTER TABLE payment ADD COLUMN IF NOT EXISTS listing_title VARCHAR(255);
ALTER TABLE payment ADD COLUMN IF NOT EXISTS listing_no VARCHAR(50);
ALTER TABLE payment ADD COLUMN IF NOT EXISTS provider_name VARCHAR(50);
ALTER TABLE payment ADD COLUMN IF NOT EXISTS provider_transaction_id VARCHAR(100);
ALTER TABLE payment ADD COLUMN IF NOT EXISTS payment_direction VARCHAR(50);
ALTER TABLE payment ADD COLUMN IF NOT EXISTS processed_at TIMESTAMP;
ALTER TABLE payment ADD COLUMN IF NOT EXISTS is_success BOOLEAN DEFAULT TRUE;
ALTER TABLE payment ADD COLUMN IF NOT EXISTS from_user_id BIGINT REFERENCES users(id);
ALTER TABLE payment ADD COLUMN IF NOT EXISTS to_user_id BIGINT REFERENCES users(id);
ALTER TABLE payment ADD COLUMN IF NOT EXISTS idempotency_key VARCHAR(255);

-- Change order_id column to UUID in payment table if it was BIGINT
DO $$ 
BEGIN 
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'payment' AND column_name = 'order_id' AND data_type != 'uuid'
    ) THEN 
        ALTER TABLE payment DROP COLUMN order_id;
        ALTER TABLE payment ADD COLUMN order_id UUID;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_payment_from_user_idempotency ON payment(from_user_id, idempotency_key);
