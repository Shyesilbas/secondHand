-- V14: Add P2P safe meetup delivery and geolocation fields
ALTER TABLE listings ADD COLUMN allow_meetup BOOLEAN DEFAULT FALSE;

ALTER TABLE orders ADD COLUMN delivery_method VARCHAR(30) DEFAULT 'CARGO';
ALTER TABLE orders ADD COLUMN meetup_location VARCHAR(255);
ALTER TABLE orders ADD COLUMN meetup_verification_code_hash VARCHAR(64);
ALTER TABLE orders ADD COLUMN verification_attempts INT DEFAULT 0;
ALTER TABLE orders ADD COLUMN verification_locked_until TIMESTAMP;
ALTER TABLE orders ADD COLUMN meetup_verified_at TIMESTAMP;
ALTER TABLE orders ADD COLUMN completed_by_user_id BIGINT;
ALTER TABLE orders ADD COLUMN completed_at TIMESTAMP;
