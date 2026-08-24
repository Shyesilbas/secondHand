-- V19: Add performance indexes for paginated email filtering and inbox unread badge queries

-- 1. Index for filtered inbox retrieval by user, email type and soft-delete flag
CREATE INDEX IF NOT EXISTS idx_emails_user_type_deleted 
    ON emails (user_id, email_type, deleted_at);

-- 2. Index for fast unread count queries (read_at IS NULL and deleted_at IS NULL)
CREATE INDEX IF NOT EXISTS idx_emails_user_read_deleted 
    ON emails (user_id, read_at) 
    WHERE deleted_at IS NULL;

-- 3. Data hygiene: Normalize any legacy email types if present in existing rows
UPDATE emails 
SET email_type = 'PAYMENT_RECEIPT' 
WHERE email_type = 'PAYMENT_SUCCESS';

UPDATE emails 
SET email_type = 'AGREEMENT_UPDATED' 
WHERE email_type = 'AGREEMENT_UPDATE';

UPDATE emails 
SET email_type = 'NEW_LISTING_NOTIFICATION' 
WHERE email_type = 'NEW_LISTING';

UPDATE emails 
SET email_type = 'GREAT_SELLER_ACHIEVEMENT' 
WHERE email_type = 'GREAT_SELLER';
