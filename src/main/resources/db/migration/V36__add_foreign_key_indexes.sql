-- DB-03: indexes for foreign keys and lookup columns used by the auth, payment, order and escrow queries.
-- PostgreSQL does not index foreign key columns automatically. Without these, the queries below scan
-- the whole table, and deleting or updating a referenced row scans the child table.
-- Plain CREATE INDEX (not CONCURRENTLY) because Flyway runs each migration in a transaction; the
-- tables are small at this point, so the short write lock is acceptable.

-- tokens: revoke/expire by user and status, family revoke on refresh-token reuse
CREATE INDEX IF NOT EXISTS idx_tokens_user_status ON tokens (user_id, token_status);
CREATE INDEX IF NOT EXISTS idx_tokens_family_id ON tokens (family_id);

-- payment: from_user_id is already covered by idx_payment_from_user_idempotency (leading column)
CREATE INDEX IF NOT EXISTS idx_payment_to_user_id ON payment (to_user_id);
CREATE INDEX IF NOT EXISTS idx_payment_order_id_to_user ON payment (order_id, to_user_id);
CREATE INDEX IF NOT EXISTS idx_payment_order_item_id ON payment (order_item_id);

-- order_items: items of an order, seller dashboards, listing sales
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items (order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_seller_id ON order_items (seller_id);
CREATE INDEX IF NOT EXISTS idx_order_items_listing_id ON order_items (listing_id);

-- escrows: order_item_id is already unique
CREATE INDEX IF NOT EXISTS idx_escrows_order_id ON escrows (order_id);
CREATE INDEX IF NOT EXISTS idx_escrows_seller_id ON escrows (seller_id);
CREATE INDEX IF NOT EXISTS idx_escrows_buyer_id ON escrows (buyer_id);
