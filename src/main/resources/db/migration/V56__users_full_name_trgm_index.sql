-- PF-16: user search matches one expression, LOWER(name || ' ' || surname) LIKE '%q%'. A trigram GIN index on that
-- exact expression lets PostgreSQL avoid a full scan of users. Skipped with a warning when pg_trgm is missing (V35).
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_trgm') THEN
        EXECUTE 'CREATE INDEX IF NOT EXISTS idx_users_full_name_trgm ON users USING gin (LOWER(name || '' '' || surname) gin_trgm_ops)';
    ELSE
        RAISE WARNING 'pg_trgm extension is not installed; skipping trigram index on users';
    END IF;
END $$;
