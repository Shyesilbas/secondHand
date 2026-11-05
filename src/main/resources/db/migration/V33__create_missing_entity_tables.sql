-- =============================================================================
-- V33: Tables mapped by JPA entities but missing from V1-V23.
-- With ddl-auto=validate a fresh database failed schema validation at startup.
-- Columns, nullability, unique constraints, indexes and foreign keys follow the
-- Hibernate mapping of each entity. IF NOT EXISTS keeps this safe for databases
-- where these tables were already created by the removed V2-V32 migrations.
-- Numbered above V32 because databases migrated before the history rewrite
-- already record V24-V32 as applied and would silently skip a lower version.
-- =============================================================================

-- ─── Reviews (Integer/SERIAL) ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS reviews (
    id SERIAL PRIMARY KEY,
    reviewer_id BIGINT NOT NULL REFERENCES users (id),
    reviewed_user_id BIGINT NOT NULL REFERENCES users (id),
    order_item_id BIGINT NOT NULL UNIQUE REFERENCES order_items (id),
    rating INTEGER NOT NULL,
    comment VARCHAR(1000),
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP,
    UNIQUE (reviewer_id, order_item_id)
);

CREATE INDEX IF NOT EXISTS idx_reviews_reviewed_user_created_at ON reviews (reviewed_user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_reviews_reviewer_created_at ON reviews (reviewer_id, created_at);

-- ─── Chat room participants (ChatRoom.participantIds) ─────────────────────────
CREATE TABLE IF NOT EXISTS chat_room_participants (
    chat_room_id BIGINT NOT NULL REFERENCES chat_rooms (id),
    user_id BIGINT
);

CREATE INDEX IF NOT EXISTS idx_chat_room_participants_user ON chat_room_participants (user_id);
CREATE INDEX IF NOT EXISTS idx_chat_room_participants_room ON chat_room_participants (chat_room_id);

-- ─── Agreements ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS agreement_requirements (
    id UUID PRIMARY KEY,
    group_code VARCHAR(255) NOT NULL,
    agreement_type VARCHAR(255) NOT NULL,
    display_order INTEGER NOT NULL,
    active BOOLEAN NOT NULL,
    created_date DATE NOT NULL,
    updated_date DATE NOT NULL,
    CONSTRAINT uk_agreement_requirements_group_type UNIQUE (group_code, agreement_type)
);

CREATE TABLE IF NOT EXISTS agreement_update_events (
    id UUID PRIMARY KEY,
    agreement_type VARCHAR(255) NOT NULL,
    version VARCHAR(50) NOT NULL,
    detected_at TIMESTAMP NOT NULL,
    CONSTRAINT uk_agreement_update_events_type_version UNIQUE (agreement_type, version)
);

-- ─── Notification event reads ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notification_event_reads (
    id UUID PRIMARY KEY,
    event_id UUID NOT NULL,
    user_id BIGINT NOT NULL,
    read_at TIMESTAMP NOT NULL,
    CONSTRAINT uk_notification_event_reads_event_user UNIQUE (event_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_event_read_lookup ON notification_event_reads (event_id, user_id);

-- ─── Forum reactions (Long/BIGSERIAL) ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS forum_thread_reaction (
    id BIGSERIAL PRIMARY KEY,
    thread_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    reaction VARCHAR(16) NOT NULL,
    created_at TIMESTAMP NOT NULL,
    CONSTRAINT uk_forum_thread_reaction_thread_user UNIQUE (thread_id, user_id)
);

CREATE TABLE IF NOT EXISTS forum_comment_reaction (
    id BIGSERIAL PRIMARY KEY,
    comment_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    reaction VARCHAR(16) NOT NULL,
    created_at TIMESTAMP NOT NULL,
    CONSTRAINT uk_forum_comment_reaction_comment_user UNIQUE (comment_id, user_id)
);

-- ─── Campaign and coupon eligibility (element collections) ────────────────────
CREATE TABLE IF NOT EXISTS campaign_eligible_listings (
    campaign_id UUID NOT NULL REFERENCES campaigns (id),
    listing_id UUID
);

CREATE TABLE IF NOT EXISTS campaign_eligible_types (
    campaign_id UUID NOT NULL REFERENCES campaigns (id),
    listing_type VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS coupon_eligible_types (
    coupon_id UUID NOT NULL REFERENCES coupons (id),
    listing_type VARCHAR(255) NOT NULL,
    PRIMARY KEY (coupon_id, listing_type)
);

-- ─── Aura AI user memory ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_memories (
    user_id BIGINT PRIMARY KEY,
    user_name VARCHAR(200),
    preferred_tone VARCHAR(50),
    summary_of_past_conversations TEXT,
    user_notes TEXT,
    second_hand_profile_json TEXT
);

CREATE TABLE IF NOT EXISTS user_memory_interests (
    user_id BIGINT NOT NULL REFERENCES user_memories (user_id),
    interest VARCHAR(200) NOT NULL
);
