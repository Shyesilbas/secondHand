-- V16: Add meetup_verification_code column to persist plain verification code for buyers
ALTER TABLE orders ADD COLUMN IF NOT EXISTS meetup_verification_code VARCHAR(10);
