-- =============================================================================
-- V20: Migrate real estate reference tables to deterministic UUIDs
--
-- Context:
--   RealEstateType, HeatingType, RealEstateAdType, and ListingOwnerType were
--   previously seeded with @GeneratedValue UUIDs, meaning each deployment
--   produced different primary keys.  This migration replaces those random UUIDs
--   with fixed, well-known UUIDs so that FK references in real_estate_listings
--   remain stable across all environments (dev / staging / prod / CI).
--
-- Strategy:
--   1. Add a temporary column `new_id` on each reference table.
--   2. Populate `new_id` with the canonical UUID derived from the `name` key.
--   3. Drop the FK constraints on real_estate_listings that reference the old PK.
--   4. Update the FK columns in real_estate_listings to point to `new_id`.
--   5. Swap the primary key: drop old `id`, rename `new_id` to `id`.
--   6. Re-create the FK constraints.
--
-- NOTE: Any rows in real_estate_listings that reference a type key NOT listed
--       below will have their FK set to NULL (ON DELETE SET NULL semantics are
--       mimicked via a LEFT JOIN).  Add more WHEN clauses if new keys were
--       introduced before this migration runs.
-- =============================================================================

DO $$
DECLARE
    fk record;
BEGIN
    FOR fk IN
        SELECT c.conname
        FROM pg_constraint c
        JOIN pg_class t ON t.oid = c.conrelid
        JOIN pg_namespace n ON n.oid = t.relnamespace
        JOIN unnest(c.conkey) AS cols(attnum) ON true
        JOIN pg_attribute a ON a.attrelid = t.oid AND a.attnum = cols.attnum
        WHERE c.contype = 'f'
          AND n.nspname = current_schema()
          AND t.relname = 'real_estate_listings'
          AND a.attname IN ('real_estate_type_id', 'ad_type_id', 'heating_type_id', 'owner_type_id')
    LOOP
        EXECUTE format('ALTER TABLE real_estate_listings DROP CONSTRAINT %I', fk.conname);
    END LOOP;
END $$;

-- 1. real_estate_types

ALTER TABLE real_estate_types ADD COLUMN new_id UUID;

UPDATE real_estate_types SET new_id = CASE name
    WHEN 'APARTMENT'    THEN '10000001-0000-0000-0000-000000000001'::uuid
    WHEN 'RESIDENCE'    THEN '10000001-0000-0000-0000-000000000002'::uuid
    WHEN 'STUDIO'       THEN '10000001-0000-0000-0000-000000000003'::uuid
    WHEN 'DUPLEX'       THEN '10000001-0000-0000-0000-000000000004'::uuid
    WHEN 'PENTHOUSE'    THEN '10000001-0000-0000-0000-000000000005'::uuid
    WHEN 'HOUSE'        THEN '10000001-0000-0000-0000-000000000006'::uuid
    WHEN 'VILLA'        THEN '10000001-0000-0000-0000-000000000007'::uuid
    WHEN 'TOWNHOUSE'    THEN '10000001-0000-0000-0000-000000000008'::uuid
    WHEN 'SUMMER_HOUSE' THEN '10000001-0000-0000-0000-000000000009'::uuid
    WHEN 'CHALET'       THEN '10000001-0000-0000-0000-000000000010'::uuid
    WHEN 'MANSION'      THEN '10000001-0000-0000-0000-000000000011'::uuid
    WHEN 'LAND'         THEN '10000001-0000-0000-0000-000000000012'::uuid
    WHEN 'FARM'         THEN '10000001-0000-0000-0000-000000000013'::uuid
    WHEN 'VINEYARD'     THEN '10000001-0000-0000-0000-000000000014'::uuid
    WHEN 'OLIVE_GROVE'  THEN '10000001-0000-0000-0000-000000000015'::uuid
    WHEN 'OFFICE'       THEN '10000001-0000-0000-0000-000000000016'::uuid
    WHEN 'COMMERCIAL'   THEN '10000001-0000-0000-0000-000000000017'::uuid
    WHEN 'SHOP'         THEN '10000001-0000-0000-0000-000000000018'::uuid
    WHEN 'WAREHOUSE'    THEN '10000001-0000-0000-0000-000000000019'::uuid
    WHEN 'FACTORY'      THEN '10000001-0000-0000-0000-000000000020'::uuid
    WHEN 'INDUSTRIAL'   THEN '10000001-0000-0000-0000-000000000021'::uuid
    WHEN 'HOTEL'        THEN '10000001-0000-0000-0000-000000000022'::uuid
    WHEN 'PARKING'      THEN '10000001-0000-0000-0000-000000000023'::uuid
    WHEN 'OTHER'        THEN '10000001-0000-0000-0000-000000000024'::uuid
    ELSE gen_random_uuid()   -- unknown keys keep a fresh UUID
END;

-- Migrate FK in real_estate_listings
ALTER TABLE real_estate_listings DROP CONSTRAINT IF EXISTS fk_real_estate_listings_type;
UPDATE real_estate_listings rel
SET real_estate_type_id = rt.new_id
FROM real_estate_types rt
WHERE rel.real_estate_type_id = rt.id;

-- Swap PK
ALTER TABLE real_estate_types DROP CONSTRAINT real_estate_types_pkey;
ALTER TABLE real_estate_types DROP COLUMN id;
ALTER TABLE real_estate_types RENAME COLUMN new_id TO id;
ALTER TABLE real_estate_types ADD PRIMARY KEY (id);

-- Re-add FK
ALTER TABLE real_estate_listings
    ADD CONSTRAINT fk_real_estate_listings_type
    FOREIGN KEY (real_estate_type_id) REFERENCES real_estate_types(id) ON DELETE SET NULL;

-- 2. real_estate_ad_types

ALTER TABLE real_estate_ad_types ADD COLUMN new_id UUID;

UPDATE real_estate_ad_types SET new_id = CASE name
    WHEN 'FOR_SALE'   THEN '20000002-0000-0000-0000-000000000001'::uuid
    WHEN 'FOR_RENT'   THEN '20000002-0000-0000-0000-000000000002'::uuid
    WHEN 'DAILY_RENT' THEN '20000002-0000-0000-0000-000000000003'::uuid
    WHEN 'ROOMMATE'   THEN '20000002-0000-0000-0000-000000000004'::uuid
    ELSE gen_random_uuid()
END;

ALTER TABLE real_estate_listings DROP CONSTRAINT IF EXISTS fk_real_estate_listings_ad_type;
UPDATE real_estate_listings rel
SET ad_type_id = adt.new_id
FROM real_estate_ad_types adt
WHERE rel.ad_type_id = adt.id;

ALTER TABLE real_estate_ad_types DROP CONSTRAINT real_estate_ad_types_pkey;
ALTER TABLE real_estate_ad_types DROP COLUMN id;
ALTER TABLE real_estate_ad_types RENAME COLUMN new_id TO id;
ALTER TABLE real_estate_ad_types ADD PRIMARY KEY (id);

ALTER TABLE real_estate_listings
    ADD CONSTRAINT fk_real_estate_listings_ad_type
    FOREIGN KEY (ad_type_id) REFERENCES real_estate_ad_types(id) ON DELETE SET NULL;

-- 3. heating_types

ALTER TABLE heating_types ADD COLUMN new_id UUID;

UPDATE heating_types SET new_id = CASE name
    WHEN 'NONE'             THEN '30000003-0000-0000-0000-000000000001'::uuid
    WHEN 'STOVE'            THEN '30000003-0000-0000-0000-000000000002'::uuid
    WHEN 'NATURAL_GAS'      THEN '30000003-0000-0000-0000-000000000003'::uuid
    WHEN 'CENTRAL_SYSTEM'   THEN '30000003-0000-0000-0000-000000000004'::uuid
    WHEN 'COMBI_BOILER'     THEN '30000003-0000-0000-0000-000000000005'::uuid
    WHEN 'AIR_CONDITIONER'  THEN '30000003-0000-0000-0000-000000000006'::uuid
    WHEN 'GEOTHERMAL'       THEN '30000003-0000-0000-0000-000000000007'::uuid
    WHEN 'FLOOR_HEATING'    THEN '30000003-0000-0000-0000-000000000008'::uuid
    WHEN 'SOLAR_ENERGY'     THEN '30000003-0000-0000-0000-000000000009'::uuid
    WHEN 'HEAT_PUMP'        THEN '30000003-0000-0000-0000-000000000010'::uuid
    WHEN 'DISTRICT_HEATING' THEN '30000003-0000-0000-0000-000000000011'::uuid
    WHEN 'ELECTRIC_RADIATOR'THEN '30000003-0000-0000-0000-000000000012'::uuid
    WHEN 'OTHER'            THEN '30000003-0000-0000-0000-000000000013'::uuid
    ELSE gen_random_uuid()
END;

ALTER TABLE real_estate_listings DROP CONSTRAINT IF EXISTS fk_real_estate_listings_heating;
UPDATE real_estate_listings rel
SET heating_type_id = ht.new_id
FROM heating_types ht
WHERE rel.heating_type_id = ht.id;

ALTER TABLE heating_types DROP CONSTRAINT heating_types_pkey;
ALTER TABLE heating_types DROP COLUMN id;
ALTER TABLE heating_types RENAME COLUMN new_id TO id;
ALTER TABLE heating_types ADD PRIMARY KEY (id);

ALTER TABLE real_estate_listings
    ADD CONSTRAINT fk_real_estate_listings_heating
    FOREIGN KEY (heating_type_id) REFERENCES heating_types(id) ON DELETE SET NULL;

-- 4. listing_owner_types

ALTER TABLE listing_owner_types ADD COLUMN new_id UUID;

UPDATE listing_owner_types SET new_id = CASE name
    WHEN 'OWNER'   THEN '40000004-0000-0000-0000-000000000001'::uuid
    WHEN 'AGENCY'  THEN '40000004-0000-0000-0000-000000000002'::uuid
    WHEN 'BUILDER' THEN '40000004-0000-0000-0000-000000000003'::uuid
    WHEN 'BANK'    THEN '40000004-0000-0000-0000-000000000004'::uuid
    ELSE gen_random_uuid()
END;

ALTER TABLE real_estate_listings DROP CONSTRAINT IF EXISTS fk_real_estate_listings_owner;
UPDATE real_estate_listings rel
SET owner_type_id = ot.new_id
FROM listing_owner_types ot
WHERE rel.owner_type_id = ot.id;

ALTER TABLE listing_owner_types DROP CONSTRAINT listing_owner_types_pkey;
ALTER TABLE listing_owner_types DROP COLUMN id;
ALTER TABLE listing_owner_types RENAME COLUMN new_id TO id;
ALTER TABLE listing_owner_types ADD PRIMARY KEY (id);

ALTER TABLE real_estate_listings
    ADD CONSTRAINT fk_real_estate_listings_owner
    FOREIGN KEY (owner_type_id) REFERENCES listing_owner_types(id) ON DELETE SET NULL;
