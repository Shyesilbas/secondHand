UPDATE payment
SET payment_type = 'EWALLET'
WHERE payment_type IN ('CREDIT_CARD', 'TRANSFER');

UPDATE orders
SET payment_method = 'EWALLET'
WHERE payment_method IN ('CREDIT_CARD', 'TRANSFER');

DROP TABLE IF EXISTS credit_card;
DROP TABLE IF EXISTS bank;

ALTER TABLE payment DROP CONSTRAINT IF EXISTS payment_idempotencykey_key;
ALTER TABLE payment DROP CONSTRAINT IF EXISTS payment_idempotency_key_key;
ALTER TABLE payment DROP CONSTRAINT IF EXISTS uk_payment_idempotency_key;
DROP INDEX IF EXISTS uk_payment_from_user_idempotency;
CREATE UNIQUE INDEX IF NOT EXISTS uk_payment_from_user_idempotency
    ON payment (from_user_id, idempotency_key)
    WHERE idempotency_key IS NOT NULL;
