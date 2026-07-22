-- ─── Fix Inventory Table ───────────────────────────────────────────────────────

ALTER TABLE inventory ADD COLUMN IF NOT EXISTS id UUID DEFAULT uuid_generate_v4();
ALTER TABLE inventory ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE inventory ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- ─── Fix Users Table ───────────────────────────────────────────────────────────

ALTER TABLE users ADD COLUMN IF NOT EXISTS password VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS account_verified BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS acc_status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE';
ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(16) DEFAULT 'USER';
ALTER TABLE users ADD COLUMN IF NOT EXISTS gender VARCHAR(50) NOT NULL DEFAULT 'UNKNOWN';
ALTER TABLE users ADD COLUMN IF NOT EXISTS birthdate DATE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS acc_creation_date DATE DEFAULT CURRENT_DATE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login_date TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login_ip VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS great_seller_eligible_snapshot BOOLEAN;

-- ─── Fix User Agreements Table ─────────────────────────────────────────────────

ALTER TABLE user_agreements ADD COLUMN IF NOT EXISTS user_agreement_id UUID DEFAULT uuid_generate_v4();
ALTER TABLE user_agreements ADD COLUMN IF NOT EXISTS accepted_version VARCHAR(50);
ALTER TABLE user_agreements ADD COLUMN IF NOT EXISTS is_accepted_the_last_version BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE user_agreements ADD COLUMN IF NOT EXISTS accepted_date DATE DEFAULT CURRENT_DATE;
ALTER TABLE user_agreements ADD COLUMN IF NOT EXISTS agreement_agreement_id UUID;
