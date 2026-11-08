-- Shared listing attribute framework + vehicle version catalog layer.
-- See listing/README.md ("Attributes" and "Vehicle catalog").

-- 1. Attribute definitions: which extra keys a listing type (and scope, e.g. vehicle type CAR) accepts.
CREATE TABLE listing_attribute_definitions (
    id           UUID PRIMARY KEY,
    listing_type VARCHAR(50)  NOT NULL,
    scope_key    VARCHAR(100) NOT NULL DEFAULT 'ALL',
    attr_key     VARCHAR(100) NOT NULL,
    label        VARCHAR(150) NOT NULL,
    unit         VARCHAR(30),
    data_type    VARCHAR(30)  NOT NULL,
    level        VARCHAR(20)  NOT NULL,
    min_value    NUMERIC(19, 4),
    max_value    NUMERIC(19, 4),
    required     BOOLEAN      NOT NULL DEFAULT FALSE,
    filterable   BOOLEAN      NOT NULL DEFAULT FALSE,
    sort_order   INTEGER      NOT NULL DEFAULT 0,
    source       VARCHAR(30)  NOT NULL DEFAULT 'claude-draft',
    CONSTRAINT uq_listing_attribute_definition UNIQUE (listing_type, scope_key, attr_key)
);

CREATE TABLE listing_attribute_options (
    id            UUID PRIMARY KEY,
    definition_id UUID         NOT NULL REFERENCES listing_attribute_definitions (id) ON DELETE CASCADE,
    option_group  VARCHAR(20)  NOT NULL DEFAULT 'VALUE',
    value         VARCHAR(100) NOT NULL,
    label         VARCHAR(150) NOT NULL,
    sort_order    INTEGER      NOT NULL DEFAULT 0,
    CONSTRAINT uq_listing_attribute_option UNIQUE (definition_id, option_group, value)
);

CREATE INDEX idx_listing_attribute_options_definition ON listing_attribute_options (definition_id);

-- 2. Listing-level attribute values.
ALTER TABLE listings ADD COLUMN attributes JSONB NOT NULL DEFAULT '{}'::jsonb;
CREATE INDEX idx_listings_attributes ON listings USING GIN (attributes jsonb_path_ops);

-- 3. Generation-level body facts (same for every version of the generation).
ALTER TABLE vehicle_generations ADD COLUMN body_type VARCHAR(50);
ALTER TABLE vehicle_generations ADD COLUMN doors VARCHAR(20);
ALTER TABLE vehicle_generations ADD COLUMN seat_count VARCHAR(20);
ALTER TABLE vehicle_generations ADD COLUMN is_facelift BOOLEAN NOT NULL DEFAULT FALSE;

-- 4. Versions: engine + gearbox + drivetrain combination of a generation, the leaf that fills listing specs.
CREATE TABLE vehicle_versions (
    id                    UUID PRIMARY KEY,
    vehicle_generation_id UUID         NOT NULL REFERENCES vehicle_generations (id) ON DELETE CASCADE,
    name                  VARCHAR(150) NOT NULL,
    fuel_type             VARCHAR(50),
    engine_capacity       INTEGER,
    horse_power           INTEGER,
    power_kw              INTEGER,
    torque_nm             INTEGER,
    gearbox               VARCHAR(50),
    gear_count            INTEGER,
    drivetrain            VARCHAR(50),
    start_year            INTEGER,
    end_year              INTEGER,
    list_price_try        NUMERIC(14, 2),
    source                VARCHAR(30)  NOT NULL DEFAULT 'claude-draft',
    specs                 JSONB        NOT NULL DEFAULT '{}'::jsonb
);

CREATE INDEX idx_vehicle_versions_generation ON vehicle_versions (vehicle_generation_id);

CREATE TABLE vehicle_version_trims (
    vehicle_version_id UUID NOT NULL REFERENCES vehicle_versions (id) ON DELETE CASCADE,
    vehicle_trim_id    UUID NOT NULL REFERENCES vehicle_trims (id) ON DELETE CASCADE,
    PRIMARY KEY (vehicle_version_id, vehicle_trim_id)
);

CREATE INDEX idx_vehicle_version_trims_trim ON vehicle_version_trims (vehicle_trim_id);

ALTER TABLE vehicle_listings
    ADD COLUMN vehicle_version_id UUID REFERENCES vehicle_versions (id) ON DELETE SET NULL;
CREATE INDEX idx_vehicle_listings_version ON vehicle_listings (vehicle_version_id);

-- 5. Every existing engine becomes a version with the same id, so the seed keeps both in step
--    and listings that picked an engine now point at the matching version.
INSERT INTO vehicle_versions (id, vehicle_generation_id, name, fuel_type, engine_capacity, horse_power)
SELECT e.id, e.vehicle_generation_id, e.name, e.fuel_type, e.engine_capacity, e.horse_power
FROM vehicle_engines e;

UPDATE vehicle_listings
SET vehicle_version_id = vehicle_engine_id
WHERE vehicle_engine_id IS NOT NULL;
