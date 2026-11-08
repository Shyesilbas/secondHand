-- Condition and history answers live in listings.attributes since V41 (data/attributes/electronics.json);
-- V41 copied these columns there and the entity no longer maps them.
ALTER TABLE electronic_listings
    DROP COLUMN battery_health_percent,
    DROP COLUMN battery_replaced,
    DROP COLUMN battery_original,
    DROP COLUMN screen_replaced,
    DROP COLUMN body_replaced,
    DROP COLUMN face_id_working,
    DROP COLUMN touch_id_working,
    DROP COLUMN has_box,
    DROP COLUMN has_invoice,
    DROP COLUMN imei_registered,
    DROP COLUMN warranty_end_date;
