-- V22: Add start/end year to vehicle_generations and horsepower/capacity to vehicle_engines

ALTER TABLE vehicle_generations
    ADD COLUMN IF NOT EXISTS start_year INT,
    ADD COLUMN IF NOT EXISTS end_year INT;

ALTER TABLE vehicle_engines
    ADD COLUMN IF NOT EXISTS horse_power INT,
    ADD COLUMN IF NOT EXISTS engine_capacity INT;

CREATE INDEX IF NOT EXISTS idx_vehicle_generations_start_year ON vehicle_generations (start_year);
CREATE INDEX IF NOT EXISTS idx_vehicle_engines_hp_capacity ON vehicle_engines (horse_power, engine_capacity);
