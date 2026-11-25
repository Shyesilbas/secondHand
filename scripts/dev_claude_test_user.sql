-- Local dev only: test account used by Claude to sign in to the app on localhost when diagnosing UI issues.
-- Email: claude.dev@example.test   Password: Claude-dev-1
-- Run: docker exec -i secondhand_postgres_dev psql -U postgres -d secondhand < scripts/dev_claude_test_user.sql
INSERT INTO users (email, password, name, surname, phone, gender, plan, account_verified, acc_status, role)
VALUES ('claude.dev@example.test', '$2a$10$A3mojipY1btP2MePJUD8P.KZPZ96ZEH4Cj.oP.yw3rxh2LUbrgcVq', 'Claude', 'Dev', '05000000001', 'PREFER_NOT_TO_SAY', 'PREMIUM', true, 'ACTIVE', 'USER')
ON CONFLICT (email) DO UPDATE SET password = EXCLUDED.password, account_verified = true, acc_status = 'ACTIVE';
