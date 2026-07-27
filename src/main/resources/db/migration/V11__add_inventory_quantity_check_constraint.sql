-- Migration: Add check constraint to inventory table to enforce available_quantity >= 0
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'chk_inventory_available_quantity_non_negative'
    ) THEN
        ALTER TABLE inventory ADD CONSTRAINT chk_inventory_available_quantity_non_negative CHECK (available_quantity >= 0);
    END IF;
END $$;
