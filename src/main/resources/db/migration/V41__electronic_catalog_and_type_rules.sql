-- Electronics follow the vehicle pattern: type rules from data/electronics/types.json, catalog facts on the
-- model (specs, official colors) and a variant leaf (RAM / storage / CPU combination) a listing copies.
-- See listing/README.md ("Electronics catalog").

-- 1. Type rules: display order and spec field -> REQUIRED | OPTIONAL | HIDDEN (a field the map does not name is HIDDEN).
ALTER TABLE electronic_types ADD COLUMN sort_order INTEGER NOT NULL DEFAULT 0;
ALTER TABLE electronic_types ADD COLUMN field_rules JSONB NOT NULL DEFAULT '{}'::jsonb;

-- 2. Model catalog facts: specs (screen, chipset, battery, camera, connectivity ...) and official colors
--    ([{"name": "Çöl Titanyum", "color": "BEIGE"}], color = Color enum used by filters).
ALTER TABLE electronic_models ADD COLUMN specs JSONB NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE electronic_models ADD COLUMN colors JSONB NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE electronic_models ADD COLUMN source VARCHAR(20);

-- 3. Variants: the configuration of a model a listing picks (phone: storage + RAM; laptop: CPU + GPU + RAM + SSD).
CREATE TABLE electronic_model_variants (
    id                  UUID PRIMARY KEY,
    electronic_model_id UUID         NOT NULL REFERENCES electronic_models(id) ON DELETE CASCADE,
    name                VARCHAR(150) NOT NULL,
    sort_order          INTEGER      NOT NULL DEFAULT 0,
    ram                 INTEGER,
    storage             INTEGER,
    storage_type        VARCHAR(50),
    processor           VARCHAR(100),
    chipset             VARCHAR(150),
    gpu_model           VARCHAR(100),
    specs               JSONB        NOT NULL DEFAULT '{}'::jsonb,
    source              VARCHAR(20),
    CONSTRAINT uq_electronic_model_variant_name UNIQUE (electronic_model_id, name)
);
CREATE INDEX idx_electronic_model_variants_model ON electronic_model_variants(electronic_model_id);

-- 4. Listing side: picked variant, chipset text (processor stays as the family enum) and the official color name.
ALTER TABLE electronic_listings ADD COLUMN electronic_variant_id UUID REFERENCES electronic_model_variants(id) ON DELETE SET NULL;
ALTER TABLE electronic_listings ADD COLUMN chipset VARCHAR(150);
ALTER TABLE electronic_listings ADD COLUMN color_name VARCHAR(100);
CREATE INDEX idx_electronic_listings_variant ON electronic_listings(electronic_variant_id);

-- 5. Condition and history answers move to listings.attributes (data/attributes/electronics.json), only keys the
--    listing's type defines. The old columns are no longer mapped and are dropped by a later migration.
UPDATE listings l
SET attributes = l.attributes || jsonb_strip_nulls(jsonb_build_object(
        'hasBox', e.has_box,
        'hasInvoice', e.has_invoice,
        'warrantyEndDate', to_char(e.warranty_end_date, 'YYYY-MM-DD')))
FROM electronic_listings e
WHERE e.id = l.id;

UPDATE listings l
SET attributes = l.attributes || jsonb_strip_nulls(jsonb_build_object(
        'batteryHealthPercent', e.battery_health_percent,
        'batteryReplaced', e.battery_replaced,
        'screenReplaced', e.screen_replaced))
FROM electronic_listings e
JOIN electronic_types t ON t.id = e.electronic_type_id
WHERE e.id = l.id AND t.name IN ('MOBILE_PHONE', 'TABLET', 'LAPTOP');

UPDATE listings l
SET attributes = l.attributes || jsonb_strip_nulls(jsonb_build_object(
        'bodyReplaced', e.body_replaced,
        'faceIdWorking', e.face_id_working,
        'touchIdWorking', e.touch_id_working))
FROM electronic_listings e
JOIN electronic_types t ON t.id = e.electronic_type_id
WHERE e.id = l.id AND t.name IN ('MOBILE_PHONE', 'TABLET');

UPDATE listings l
SET attributes = l.attributes || jsonb_strip_nulls(jsonb_build_object(
        'batteryOriginal', e.battery_original,
        'imeiRegistered', e.imei_registered))
FROM electronic_listings e
JOIN electronic_types t ON t.id = e.electronic_type_id
WHERE e.id = l.id AND t.name = 'MOBILE_PHONE';

UPDATE listings l
SET attributes = l.attributes || jsonb_strip_nulls(jsonb_build_object(
        'batteryHealthPercent', e.battery_health_percent,
        'screenReplaced', e.screen_replaced))
FROM electronic_listings e
JOIN electronic_types t ON t.id = e.electronic_type_id
WHERE e.id = l.id AND t.name = 'SMARTWATCH';
