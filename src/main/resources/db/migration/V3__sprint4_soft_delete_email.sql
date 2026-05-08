ALTER TABLE emails
    ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP;

CREATE INDEX IF NOT EXISTS idx_emails_deleted_at ON emails (deleted_at);
