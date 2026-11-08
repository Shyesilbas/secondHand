-- Real estate follows the vehicle / electronics pattern: each property type carries its category and field rules
-- (data/realestate/realestate.json), condition-like answers live in listings.attributes
-- (data/attributes/realestate.json) and duplicate columns are folded into one. See listing/README.md.

-- 1. Type rules: category (was a hard-coded name list), display order and field -> REQUIRED | OPTIONAL | HIDDEN.
ALTER TABLE real_estate_types ADD COLUMN category VARCHAR(20) NOT NULL DEFAULT 'OTHER';
ALTER TABLE real_estate_types ADD COLUMN sort_order INTEGER NOT NULL DEFAULT 0;
ALTER TABLE real_estate_types ADD COLUMN field_rules JSONB NOT NULL DEFAULT '{}'::jsonb;

UPDATE real_estate_types SET category = CASE
    WHEN name IN ('LAND', 'COMMERCIAL_LAND', 'FARM', 'VINEYARD', 'OLIVE_GROVE') THEN 'LAND'
    WHEN name IN ('APARTMENT', 'RESIDENCE', 'STUDIO', 'DUPLEX', 'PENTHOUSE', 'HOUSE', 'VILLA', 'TOWNHOUSE',
                  'SUMMER_HOUSE', 'CHALET', 'MANSION', 'PREFABRICATED') THEN 'RESIDENTIAL'
    WHEN name IN ('OFFICE', 'COMMERCIAL', 'SHOP', 'WAREHOUSE', 'FACTORY', 'INDUSTRIAL', 'HOTEL', 'PARKING',
                  'BUILDING') THEN 'COMMERCIAL'
    ELSE 'OTHER' END;

-- 2. Listing columns: a floor picked from data/realestate/specs.json "floors" (basement, ground, garden floor,
--    numbered floors, roof); floor_number stays as the derived number filters use. Coordinates are an offset point
--    around the neighborhood center computed by the server, never the address itself.
ALTER TABLE real_estate_listings ADD COLUMN floor_key VARCHAR(30);
ALTER TABLE real_estate_listings ADD COLUMN latitude NUMERIC(9, 6);
ALTER TABLE real_estate_listings ADD COLUMN longitude NUMERIC(9, 6);

-- 3. Fold duplicates into the column that stays. Older rows stored labels ("3+1", "Konut İmarlı") in key columns.
UPDATE real_estate_listings SET gross_area_m2 = square_meters
WHERE gross_area_m2 IS NULL AND square_meters > 0;

UPDATE real_estate_listings SET floor_number = floor WHERE floor_number IS NULL AND floor IS NOT NULL;
UPDATE real_estate_listings SET floor_key = CASE
    WHEN floor_number < 0 THEN 'BASEMENT'
    WHEN floor_number = 0 THEN 'GROUND'
    WHEN floor_number BETWEEN 1 AND 40 THEN 'FLOOR_' || floor_number
    END
WHERE floor_number IS NOT NULL;

UPDATE real_estate_listings r SET room_config_key = m.key
FROM (VALUES ('1+0', 'ROOM_1_0'), ('1+1', 'ROOM_1_1'), ('1.5+1', 'ROOM_1_5_1'), ('2+0', 'ROOM_2_0'),
             ('2+1', 'ROOM_2_1'), ('2+2', 'ROOM_2_2'), ('3+0', 'ROOM_3_0'), ('3+1', 'ROOM_3_1'),
             ('3+2', 'ROOM_3_2'), ('4+0', 'ROOM_4_0'), ('4+1', 'ROOM_4_1'), ('4+2', 'ROOM_4_2'),
             ('5+1', 'ROOM_5_1'), ('5+2', 'ROOM_5_2'), ('6+1', 'ROOM_6_1'), ('6+2', 'ROOM_6_2'),
             ('7+1', 'ROOM_7_1')) AS m(label, key)
WHERE r.room_config_key = m.label;

UPDATE real_estate_listings r SET zoning_status_key = m.key
FROM (VALUES ('Konut İmarlı', 'RESIDENTIAL_ZONED'), ('Ticari İmarlı', 'COMMERCIAL_ZONED'),
             ('Sanayi İmarlı', 'INDUSTRIAL_ZONED'), ('Turizm İmarlı', 'TOURISM_ZONED'),
             ('Ticari + Konut', 'MIXED_ZONED'), ('Tarla', 'AGRICULTURAL'), ('Bağ/Bahçe', 'VINEYARD_GARDEN'),
             ('Zeytinlik', 'OLIVE_GROVE'), ('Sit Alanı', 'PROTECTED_AREA'), ('İmarsız', 'UNZONED')) AS m(label, key)
WHERE coalesce(r.zoning_status_key, r.zoning_status) = m.label;

-- room_count is derived from the room plan from now on.
ALTER TABLE real_estate_listings ALTER COLUMN room_count DROP NOT NULL;
ALTER TABLE real_estate_listings ALTER COLUMN room_count DROP DEFAULT;
UPDATE real_estate_listings SET room_count = NULL WHERE room_count = 0;

-- 4. Free-text answers and facade flags move to listings.attributes as option values (unknown text is dropped).
UPDATE listings l SET attributes = l.attributes || jsonb_build_object('usageStatus', CASE
        WHEN lower(r.usage_status) IN ('boş', 'bos', 'empty') THEN 'EMPTY'
        WHEN lower(r.usage_status) IN ('kiracılı', 'kiracili', 'tenant') THEN 'TENANT'
        WHEN lower(r.usage_status) IN ('mülk sahibi', 'mulk sahibi', 'owner') THEN 'OWNER' END)
FROM real_estate_listings r
WHERE r.id = l.id AND lower(r.usage_status) IN ('boş', 'bos', 'empty', 'kiracılı', 'kiracili', 'tenant',
                                                'mülk sahibi', 'mulk sahibi', 'owner');

UPDATE listings l SET attributes = l.attributes || jsonb_build_object('deedStatus', CASE
        WHEN lower(r.deed_status) LIKE 'kat mülkiyet%' THEN 'CONDOMINIUM'
        WHEN lower(r.deed_status) LIKE 'kat irtifak%' THEN 'CONSTRUCTION_SERVITUDE'
        WHEN lower(r.deed_status) LIKE 'hisseli%' THEN 'SHARED'
        WHEN lower(r.deed_status) LIKE 'müstakil%' THEN 'DETACHED_TITLE' END)
FROM real_estate_listings r
WHERE r.id = l.id AND (lower(r.deed_status) LIKE 'kat mülkiyet%' OR lower(r.deed_status) LIKE 'kat irtifak%'
                       OR lower(r.deed_status) LIKE 'hisseli%' OR lower(r.deed_status) LIKE 'müstakil%');

UPDATE listings l SET attributes = l.attributes || jsonb_build_object('facades', to_jsonb(array_remove(ARRAY[
        CASE WHEN r.has_north_facade THEN 'NORTH' END, CASE WHEN r.has_south_facade THEN 'SOUTH' END,
        CASE WHEN r.has_east_facade THEN 'EAST' END, CASE WHEN r.has_west_facade THEN 'WEST' END], NULL)))
FROM real_estate_listings r
WHERE r.id = l.id AND (r.has_north_facade OR r.has_south_facade OR r.has_east_facade OR r.has_west_facade);

-- 5. Drop the folded columns.
ALTER TABLE real_estate_listings DROP COLUMN square_meters;
ALTER TABLE real_estate_listings DROP COLUMN floor;
ALTER TABLE real_estate_listings DROP COLUMN zoning_status;
ALTER TABLE real_estate_listings DROP COLUMN usage_status;
ALTER TABLE real_estate_listings DROP COLUMN deed_status;
ALTER TABLE real_estate_listings DROP COLUMN water_source;
ALTER TABLE real_estate_listings DROP COLUMN has_north_facade;
ALTER TABLE real_estate_listings DROP COLUMN has_south_facade;
ALTER TABLE real_estate_listings DROP COLUMN has_east_facade;
ALTER TABLE real_estate_listings DROP COLUMN has_west_facade;

CREATE INDEX idx_real_estate_listings_gross_area ON real_estate_listings(gross_area_m2);
CREATE INDEX idx_real_estate_listings_room_count ON real_estate_listings(room_count);
