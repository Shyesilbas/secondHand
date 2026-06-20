-- Add premium fields to Clothing
ALTER TABLE clothing_listings ADD COLUMN clothing_fit VARCHAR(30);
ALTER TABLE clothing_listings ADD COLUMN clothing_pattern VARCHAR(30);
ALTER TABLE clothing_listings ADD COLUMN fabric_type VARCHAR(30);

-- Add premium fields to Real Estate
ALTER TABLE real_estate_listings ADD COLUMN building_condition VARCHAR(30);
ALTER TABLE real_estate_listings ADD COLUMN is_exchangeable BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE real_estate_listings ADD COLUMN has_north_facade BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE real_estate_listings ADD COLUMN has_south_facade BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE real_estate_listings ADD COLUMN has_east_facade BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE real_estate_listings ADD COLUMN has_west_facade BOOLEAN NOT NULL DEFAULT FALSE;
