-- "Delete message" keeps the row and its text for complaints and moderation; clients see a tombstone.
ALTER TABLE messages ADD COLUMN IF NOT EXISTS deleted_by_sender_at TIMESTAMP NULL;
