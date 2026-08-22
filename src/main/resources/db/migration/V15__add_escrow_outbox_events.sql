-- =============================================================================
-- V15: Add escrow_outbox_events table for Transactional Outbox Pattern
-- =============================================================================

CREATE TABLE IF NOT EXISTS escrow_outbox_events (
    id UUID PRIMARY KEY,
    event_type VARCHAR(100) NOT NULL,
    aggregate_type VARCHAR(100) NOT NULL,
    aggregate_id VARCHAR(100) NOT NULL,
    payload TEXT NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    attempt_count INTEGER NOT NULL DEFAULT 0,
    max_attempts INTEGER NOT NULL DEFAULT 10,
    next_attempt_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_error TEXT,
    processed_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_escrow_outbox_status_next_attempt 
    ON escrow_outbox_events (status, next_attempt_at);

CREATE INDEX IF NOT EXISTS idx_escrow_outbox_aggregate 
    ON escrow_outbox_events (aggregate_type, aggregate_id);
