-- users.email already has the UNIQUE constraint's index (users_email_key); this plain index duplicated it.
DROP INDEX IF EXISTS idx_users_email;
