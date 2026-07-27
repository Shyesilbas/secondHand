-- Migration: Backfill missing inventory records for existing listings
INSERT INTO inventory (id, listing_id, available_quantity, version, created_at, updated_at)
SELECT uuid_generate_v4(), id, 1, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM listings l
WHERE NOT EXISTS (SELECT 1 FROM inventory i WHERE i.listing_id = l.id);
