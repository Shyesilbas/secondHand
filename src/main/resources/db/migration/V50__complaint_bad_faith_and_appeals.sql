-- Aura complaint moderation: bad-faith reporting (proposal section 5.3) and appeals (section 5.6).

ALTER TABLE complaints
    ADD COLUMN IF NOT EXISTS is_bad_faith_report BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS complainer_penalty_action VARCHAR(64),
    ADD COLUMN IF NOT EXISTS appeal_submitted_at TIMESTAMP,
    ADD COLUMN IF NOT EXISTS appeal_decision_notes VARCHAR(1000);

-- Prior bad-faith reports of one complainer decide between a temporary and a permanent ban.
CREATE INDEX IF NOT EXISTS idx_complaints_bad_faith_complainer
    ON complaints (complainer_id)
    WHERE is_bad_faith_report;

-- Brigade signals: recent complaints against one user.
CREATE INDEX IF NOT EXISTS idx_complaints_against_created
    ON complaints (complained_user_id, created_at);

-- Appeal review queue.
CREATE INDEX IF NOT EXISTS idx_complaints_pending_appeals
    ON complaints (appeal_submitted_at)
    WHERE appeal_status = 'PENDING';
