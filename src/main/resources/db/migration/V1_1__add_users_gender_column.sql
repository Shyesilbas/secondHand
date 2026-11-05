-- ─── Add users.gender Before V10 Runs ──────────────────────────────────────
-- V10 updates users.gender, but the current V1 baseline does not create that column; the migrations
-- that added it were deleted. On an empty database Flyway therefore stopped at V10 with
-- "column gender does not exist".
--
-- Version 1.1 sorts between V1 and V10, so on an empty database this runs before V10.
-- Databases whose history is already past V1.1 already have the column. They report this file as
-- "ignored" until it is applied out of order (spring.flyway.out-of-order=true); the statement is then a no-op.
-- The remaining columns missing from the baseline are added in V34, after the whole chain.

ALTER TABLE users ADD COLUMN IF NOT EXISTS gender VARCHAR(255) NOT NULL;
