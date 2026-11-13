-- Aura complaint moderation, phase 1: moderation state on users and review/appeal fields on complaints.
-- See docs/proposals/aura-trust-safety-and-complaint-moderation.md sections 2.1 and 2.2.

ALTER TABLE users
    ADD COLUMN IF NOT EXISTS warning_count INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS banned_until TIMESTAMP,
    ADD COLUMN IF NOT EXISTS restriction_reason VARCHAR(255),
    ADD COLUMN IF NOT EXISTS last_penalized_at TIMESTAMP,
    ADD COLUMN IF NOT EXISTS is_chat_restricted BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS is_listing_restricted BOOLEAN NOT NULL DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS idx_users_banned_until
    ON users (banned_until)
    WHERE banned_until IS NOT NULL;

ALTER TABLE complaints
    ADD COLUMN IF NOT EXISTS eligible_for_review_at TIMESTAMP,
    ADD COLUMN IF NOT EXISTS chat_room_id BIGINT,
    ADD COLUMN IF NOT EXISTS reported_message_id BIGINT,
    ADD COLUMN IF NOT EXISTS evidence_image_urls JSONB,
    ADD COLUMN IF NOT EXISTS violation_category VARCHAR(64),
    ADD COLUMN IF NOT EXISTS penalty_action VARCHAR(64),
    ADD COLUMN IF NOT EXISTS ai_confidence_score DECIMAL(3, 2),
    ADD COLUMN IF NOT EXISTS ai_reviewed_at TIMESTAMP,
    ADD COLUMN IF NOT EXISTS appeal_status VARCHAR(32) NOT NULL DEFAULT 'NONE',
    ADD COLUMN IF NOT EXISTS appeal_reason VARCHAR(1000),
    ADD COLUMN IF NOT EXISTS appeal_reviewed_at TIMESTAMP;

-- Existing complaints become reviewable two hours after creation, same as new ones.
UPDATE complaints
SET eligible_for_review_at = created_at + INTERVAL '2 HOURS'
WHERE eligible_for_review_at IS NULL;

ALTER TABLE complaints
    ALTER COLUMN eligible_for_review_at SET NOT NULL;

ALTER TABLE complaints
    ADD CONSTRAINT fk_complaint_chat_room
        FOREIGN KEY (chat_room_id) REFERENCES chat_rooms (id),
    ADD CONSTRAINT fk_complaint_reported_message
        FOREIGN KEY (reported_message_id) REFERENCES messages (id),
    ADD CONSTRAINT chk_complaint_ai_confidence
        CHECK (ai_confidence_score IS NULL OR (ai_confidence_score >= 0 AND ai_confidence_score <= 1)),
    ADD CONSTRAINT chk_complaint_appeal_status
        CHECK (appeal_status IN ('NONE', 'PENDING', 'APPROVED', 'REJECTED'));

CREATE INDEX IF NOT EXISTS idx_complaints_review_queue
    ON complaints (eligible_for_review_at)
    WHERE status = 'PENDING';

CREATE INDEX IF NOT EXISTS idx_complaints_active_pair
    ON complaints (complainer_id, complained_user_id)
    WHERE status IN ('PENDING', 'INVESTIGATING');
