ALTER TABLE emails DROP CONSTRAINT IF EXISTS emails_email_type_check;

ALTER TABLE emails ADD CONSTRAINT emails_email_type_check CHECK (
    email_type IN (
        'VERIFICATION_CODE',
        'PASSWORD_RESET',
        'WELCOME',
        'NOTIFICATION',
        'OFFER_RECEIVED',
        'OFFER_COUNTER_RECEIVED',
        'OFFER_ACCEPTED',
        'OFFER_REJECTED',
        'OFFER_EXPIRED',
        'OFFER_COMPLETED',
        'PROMOTIONAL',
        'PAYMENT_VERIFICATION',
        'AGREEMENT_UPDATED',
        'SYSTEM',
        'ORDER_CONFIRMATION',
        'MEMBERSHIP_ACTIVATED',
        'PAYMENT_RECEIPT',
        'NEW_LISTING_NOTIFICATION'
    )
);
