-- payment.order_id stores orders.external_id (UUID), not orders.id. Make that link explicit and enforced:
-- order purchase, refund and refund-debit payments must point to an existing order. NULL stays allowed for
-- payments that belong to no order (deposits, withdrawals, listing fees, showcase, membership).
-- Fails if any payment.order_id has no matching order; fix such rows before applying.

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_payment_order_external_id') THEN
        ALTER TABLE payment
            ADD CONSTRAINT fk_payment_order_external_id
            FOREIGN KEY (order_id) REFERENCES orders (external_id);
    END IF;
END $$;

COMMENT ON COLUMN payment.order_id IS 'orders.external_id of the order this payment belongs to; NULL for non-order payments';
