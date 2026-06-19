ALTER TABLE payment
    ADD COLUMN IF NOT EXISTS order_item_id BIGINT;

CREATE INDEX IF NOT EXISTS idx_payment_order_item_id
    ON payment(order_item_id);

CREATE INDEX IF NOT EXISTS idx_payment_order_to_user_order_item
    ON payment(order_id, to_user_id, order_item_id);
