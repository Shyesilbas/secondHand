-- Create vehicle model body types element collection table
CREATE TABLE vehicle_model_body_types (
    vehicle_model_id UUID NOT NULL,
    body_type VARCHAR(50) NOT NULL,
    PRIMARY KEY (vehicle_model_id, body_type),
    CONSTRAINT fk_vehicle_model_body_types_model FOREIGN KEY (vehicle_model_id) REFERENCES vehicle_models(id) ON DELETE CASCADE
);

-- Create vehicle generations table
CREATE TABLE vehicle_generations (
    id UUID PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    vehicle_model_id UUID NOT NULL,
    CONSTRAINT fk_vehicle_generations_model FOREIGN KEY (vehicle_model_id) REFERENCES vehicle_models(id) ON DELETE CASCADE
);

-- Create vehicle engines table
CREATE TABLE vehicle_engines (
    id UUID PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    vehicle_generation_id UUID NOT NULL,
    fuel_type VARCHAR(50),
    CONSTRAINT fk_vehicle_engines_generation FOREIGN KEY (vehicle_generation_id) REFERENCES vehicle_generations(id) ON DELETE CASCADE
);

-- Create vehicle trims table
CREATE TABLE vehicle_trims (
    id UUID PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    vehicle_generation_id UUID NOT NULL,
    CONSTRAINT fk_vehicle_trims_generation FOREIGN KEY (vehicle_generation_id) REFERENCES vehicle_generations(id) ON DELETE CASCADE
);

-- Add foreign key columns to vehicle_listings
ALTER TABLE vehicle_listings ADD COLUMN vehicle_generation_id UUID;
ALTER TABLE vehicle_listings ADD COLUMN vehicle_engine_id UUID;
ALTER TABLE vehicle_listings ADD COLUMN vehicle_trim_id UUID;

ALTER TABLE vehicle_listings ADD CONSTRAINT fk_vehicle_listings_generation FOREIGN KEY (vehicle_generation_id) REFERENCES vehicle_generations(id) ON DELETE SET NULL;
ALTER TABLE vehicle_listings ADD CONSTRAINT fk_vehicle_listings_engine FOREIGN KEY (vehicle_engine_id) REFERENCES vehicle_engines(id) ON DELETE SET NULL;
ALTER TABLE vehicle_listings ADD CONSTRAINT fk_vehicle_listings_trim FOREIGN KEY (vehicle_trim_id) REFERENCES vehicle_trims(id) ON DELETE SET NULL;
