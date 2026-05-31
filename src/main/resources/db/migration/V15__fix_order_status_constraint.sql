-- V15: Update orders CHECK constraints to include new enum values
-- added for Safe Meetup feature (MEETUP_PENDING, HANDOVER_CONFIRMED, VERIFICATION_LOCKED)

-- 1. Drop the old status constraint and recreate with all enum values
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check;
ALTER TABLE orders ADD CONSTRAINT orders_status_check CHECK (
    status::text = ANY (ARRAY[
        'PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED',
        'DELIVERED', 'COMPLETED', 'CANCELLED', 'REFUNDED',
        'MEETUP_PENDING', 'HANDOVER_CONFIRMED', 'VERIFICATION_LOCKED'
    ])
);
