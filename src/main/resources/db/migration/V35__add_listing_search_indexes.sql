-- V35: Add pg_trgm GIN indexes and active (created_at DESC, id DESC) B-Tree index for database-backed global listing search
-- Note: Standard CREATE INDEX is used because Flyway runs migrations inside a transaction block.
-- If the database role lacks CREATE EXTENSION privilege for pg_trgm, the migration logs a warning
-- and still creates the B-Tree ordering index without failing application startup.

CREATE INDEX IF NOT EXISTS idx_listings_active_created_at
    ON listings (created_at DESC, id DESC)
    WHERE status = 'ACTIVE';

DO $$
BEGIN
    CREATE EXTENSION IF NOT EXISTS pg_trgm;
EXCEPTION
    WHEN insufficient_privilege THEN
        RAISE WARNING 'Skipping pg_trgm extension creation due to insufficient privileges';
END $$;

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_trgm') THEN
        EXECUTE 'CREATE INDEX IF NOT EXISTS idx_listings_active_title_trgm ON listings USING gin (LOWER(title) gin_trgm_ops) WHERE status = ''ACTIVE''';
        EXECUTE 'CREATE INDEX IF NOT EXISTS idx_listings_active_description_trgm ON listings USING gin (LOWER(description) gin_trgm_ops) WHERE status = ''ACTIVE''';
        EXECUTE 'CREATE INDEX IF NOT EXISTS idx_listings_active_listing_no_trgm ON listings USING gin (LOWER(listing_no) gin_trgm_ops) WHERE status = ''ACTIVE''';
    ELSE
        RAISE WARNING 'pg_trgm extension is not installed; skipping GIN trigram indexes on listings';
    END IF;
END $$;

