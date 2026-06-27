ALTER TABLE payment DROP CONSTRAINT IF EXISTS payment_transaction_type_check;

ALTER TABLE payment ADD CONSTRAINT payment_transaction_type_check CHECK (
    transaction_type IN (
        'LISTING_CREATION',
        'ITEM_PURCHASE',
        'ITEM_SALE',
        'REFUND',
        'EWALLET_DEPOSIT',
        'EWALLET_WITHDRAWAL',
        'EWALLET_PAYMENT_RECEIVED',
        'SHOWCASE_PAYMENT',
        'MEMBERSHIP_PAYMENT'
    )
);
