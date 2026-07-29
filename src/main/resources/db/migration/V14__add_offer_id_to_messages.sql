-- Add offer_id column to messages table for in-chat offers
ALTER TABLE messages ADD COLUMN IF NOT EXISTS offer_id UUID NULL;

CREATE INDEX IF NOT EXISTS idx_messages_offer_id ON messages(offer_id);
