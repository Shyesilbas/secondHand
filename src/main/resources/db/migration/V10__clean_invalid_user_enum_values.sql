-- ─── Fix Invalid User Enum Values in Database ─────────────────────────────

UPDATE users SET plan = 'FREE' WHERE plan = 'STANDARD';
UPDATE users SET gender = 'PREFER_NOT_TO_SAY' WHERE gender = 'UNKNOWN';
