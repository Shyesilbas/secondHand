-- ─── Comprehensive Fix for All Database Tables and Entities ────────────────────

-- 1. Create missing 'reviews' table
CREATE TABLE IF NOT EXISTS reviews (
    id SERIAL PRIMARY KEY,
    reviewer_id BIGINT NOT NULL REFERENCES users(id),
    reviewed_user_id BIGINT NOT NULL REFERENCES users(id),
    order_item_id BIGINT NOT NULL REFERENCES order_items(id),
    rating INTEGER NOT NULL,
    comment VARCHAR(1000),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    CONSTRAINT uk_reviews_reviewer_order_item UNIQUE (reviewer_id, order_item_id)
);
CREATE INDEX IF NOT EXISTS idx_reviews_reviewed_user_created_at ON reviews(reviewed_user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_reviews_reviewer_created_at ON reviews(reviewer_id, created_at);

-- 2. Create missing 'notification_event_reads' table
CREATE TABLE IF NOT EXISTS notification_event_reads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL,
    user_id BIGINT NOT NULL,
    read_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_notification_event_reads_event_user UNIQUE (event_id, user_id)
);
CREATE INDEX IF NOT EXISTS idx_event_read_lookup ON notification_event_reads(event_id, user_id);

-- 3. Create missing 'user_memories' & 'user_memory_interests' tables
CREATE TABLE IF NOT EXISTS user_memories (
    user_id BIGINT PRIMARY KEY,
    user_name VARCHAR(200),
    preferred_tone VARCHAR(50),
    summary_of_past_conversations TEXT,
    user_notes TEXT,
    second_hand_profile_json TEXT
);

CREATE TABLE IF NOT EXISTS user_memory_interests (
    user_id BIGINT NOT NULL REFERENCES user_memories(user_id) ON DELETE CASCADE,
    interest VARCHAR(200) NOT NULL
);

-- 4. Fix 'verification_codes' table
ALTER TABLE verification_codes ADD COLUMN IF NOT EXISTS code_type VARCHAR(50);
ALTER TABLE verification_codes ADD COLUMN IF NOT EXISTS code_expires_at TIMESTAMP;
ALTER TABLE verification_codes ADD COLUMN IF NOT EXISTS verification_attempt_left INTEGER DEFAULT 3;
ALTER TABLE verification_codes ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE;

-- 5. Fix 'tokens' table
ALTER TABLE tokens ADD COLUMN IF NOT EXISTS token VARCHAR(1000);
ALTER TABLE tokens ADD COLUMN IF NOT EXISTS token_status VARCHAR(50) DEFAULT 'ACTIVE';
ALTER TABLE tokens ADD COLUMN IF NOT EXISTS family_id UUID;
ALTER TABLE tokens ADD COLUMN IF NOT EXISTS parent_token_id UUID;
ALTER TABLE tokens ADD COLUMN IF NOT EXISTS remember_me BOOLEAN DEFAULT FALSE;

-- 6. Fix 'notification_events' table
ALTER TABLE notification_events ADD COLUMN IF NOT EXISTS type VARCHAR(50);
ALTER TABLE notification_events ADD COLUMN IF NOT EXISTS title VARCHAR(200);
ALTER TABLE notification_events ADD COLUMN IF NOT EXISTS message VARCHAR(1000);
ALTER TABLE notification_events ADD COLUMN IF NOT EXISTS action_url VARCHAR(500);
ALTER TABLE notification_events ADD COLUMN IF NOT EXISTS metadata JSONB;

-- 7. Fix 'shippings' table
ALTER TABLE shippings ADD COLUMN IF NOT EXISTS in_transit_at TIMESTAMP;
ALTER TABLE shippings ADD COLUMN IF NOT EXISTS tracking_url VARCHAR(500);
ALTER TABLE shippings ADD COLUMN IF NOT EXISTS estimated_delivery_date TIMESTAMP;
