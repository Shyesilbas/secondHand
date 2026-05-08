-- Sprint 1 reliability foundations:
-- 1) Payment outbox durable events
-- 2) Cart/Offer optimistic locking versions
-- 3) Order payment_status normalization (PAID -> COMPLETED)

CREATE TABLE IF NOT EXISTS payment_outbox_events (
    id UUID PRIMARY KEY,
    event_type VARCHAR(100) NOT NULL,
    aggregate_type VARCHAR(100) NOT NULL,
    aggregate_id VARCHAR(100) NOT NULL,
    payload TEXT NOT NULL,
    status VARCHAR(30) NOT NULL,
    attempt_count INTEGER NOT NULL DEFAULT 0,
    max_attempts INTEGER NOT NULL DEFAULT 10,
    next_attempt_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_error TEXT NULL,
    processed_at TIMESTAMP NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_payment_outbox_status_next_attempt
    ON payment_outbox_events (status, next_attempt_at);

CREATE INDEX IF NOT EXISTS idx_payment_outbox_aggregate
    ON payment_outbox_events (aggregate_type, aggregate_id);

ALTER TABLE carts
    ADD COLUMN IF NOT EXISTS version BIGINT NOT NULL DEFAULT 0;

ALTER TABLE offers
    ADD COLUMN IF NOT EXISTS version BIGINT NOT NULL DEFAULT 0;

UPDATE orders
SET payment_status = 'COMPLETED'
WHERE payment_status = 'PAID';
