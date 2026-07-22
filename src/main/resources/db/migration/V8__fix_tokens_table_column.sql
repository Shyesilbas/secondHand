-- ─── Fix tokens table token_value column constraint and length ─────────────────
ALTER TABLE tokens ALTER COLUMN token_value TYPE VARCHAR(1000);
ALTER TABLE tokens ALTER COLUMN token_value DROP NOT NULL;
