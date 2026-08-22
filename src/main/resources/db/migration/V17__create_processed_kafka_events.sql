-- =============================================================================
-- V17: Create processed_kafka_events table for ACID DB-Level Idempotent Consumers
-- =============================================================================

CREATE TABLE IF NOT EXISTS processed_kafka_events (
    id VARCHAR(255) PRIMARY KEY,
    consumer_group VARCHAR(100) NOT NULL,
    processed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_processed_kafka_events_consumer ON processed_kafka_events (consumer_group, processed_at);
